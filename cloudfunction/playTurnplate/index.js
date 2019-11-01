// 云函数模板
// 部署：在 cloud-functions/login 文件夹右击选择 “上传并部署”

const cloud = require('wx-server-sdk')
const moment = require('moment')

// 初始化 cloud
cloud.init({
    // API 调用都保持和云函数当前所在环境一致
    env: cloud.DYNAMIC_CURRENT_ENV
    // env: "diandi-minigame-cloud"
})

// 可在入口函数外缓存 db 对象
const db = cloud.database()

// 数据库查询更新指令对象
const _ = db.command

/**
 *  检验逻辑
 */
async function checkGamePermission(openid) {
    const config = await db.collection('game_zhuanpan_config')
        .get();

    //  有效的时间范围: 当前服务器时间落入开始及结束时间之间
    const ret1 =
        config.data &&
        config.data.length > 0 &&
        moment(Date.now()).isBetween(config.data[0].startTime, config.data[0].endTime);
    console.log(ret1)

    if (!ret1) {
        return {
            result: false,
            errMsg: "游戏已结束"
        }
    }

    //  当前用户历史参加当前大转盘的总游戏次数
    let records = await db.collection('game_zhuanpan_record')
        .where({
            "_openid": openid,
            "zhuanpanId": config.data[0]._id
        })
        .count();

    console.log(records)
    if (records.total >= config.data[0].maxPlayEachPerson) {
        return {
            result: false,
            errMsg: "下次再玩吧"
        }
    }


    //  本地时间和格林威治的时间差，单位为分钟
    let offsetGMT = new Date().getTimezoneOffset();
    //  获取当前时间
    let today = new Date(moment(Date.now()).format("YYYY-MM-DD"));
    //  转换成当地时间零点整
    today = new Date(today.getTime() + offsetGMT * 60 * 1000);

    //  明天
    let tomorrow = new Date(moment(Date.now()).add(1, "d").format("YYYY-MM-DD"));
    //  转换成明天零点整
    tomorrow = new Date(tomorrow.getTime() + offsetGMT * 60 * 1000);

    //  当前用户今天参加当前大转盘的游戏次数
    records = await db.collection('game_zhuanpan_record')
        .where({
            "_openid": openid,
            "currentTime": _.gte(today).and(_.lt(tomorrow)),
            "zhuanpanId": config.data[0]._id
        })
        .count();

    //  历史与今日抽奖次数限制
    console.log(records)
    if (records.total >= config.data[0].maxPlayEachPersonEachDay) {
        return {
            result: false,
            errMsg: "明天再来玩吧"
        }
    }

    return {
        result: true,
        errMsg: "OK",
        "zhuanpanId": config.data[0]._id
    }
}

/**
 *  开始抽奖
 */
async function playTurnplate(params) {
    return db.collection('game_zhuanpan_prize')
        .where({
            "zhuanpanId": params.zhuanpanId
        })
        .get()
        .then(settings => {
            //  是否配置缺省奖项，当中奖的奖品数不足时，提供缺省奖项
            const defaultPrize = settings.data.find(item => {
                if (item.default === 1) {
                    return true;
                }
            })
            console.log(defaultPrize)
            const count = settings.data.length;

            return new Promise((resolve, reject) => {
                if (defaultPrize) {
                    //  计算各奖项的中奖区间
                    let index = 0,
                        probability = [0];
                    settings.data.forEach(item => {
                        probability.push(probability[index] + item.probability);
                        index++;
                    })

                    //  强制设置最后一项的值为1, 避免浮点运算偏差
                    probability[count] = 1;
                    //  移除第一个初始值元素
                    probability.shift();
                    //  生成随机数
                    const random = Math.random();
                    console.log("随机数:", random);
                    //  落入的中奖区间
                    index = probability.findIndex((data, index, arr) => data >= random);
                    console.log("中奖区间：", index);

                    resolve({
                        zhuanpanId: params.zhuanpanId,
                        openid: params.openid,
                        index,
                        defaultPrize,
                        settings,
                        system: params.event
                    })
                } else {
                    reject({
                        errMsg: "未配置缺省奖项"
                    })
                }
            });
        })
}

/**
 *  减少奖品数量
 */
async function reducePrizeQuantity(params) {
    return db.collection('game_zhuanpan_prize')
        .where({
            "zhuanpanId": params.zhuanpanId,
            "index": params.index,
            "quantity": _.gte(1)
        })
        .update({
            data: {
                "quantity": _.inc(-1)
            }
        })
        .then(res => {
            console.log(res);
            //  如果奖品已被抽完，选择缺省奖品
            params.index = res.stats && res.stats.updated === 0 ? params.defaultPrize.index : params.index;
            return new Promise((resolve, reject) => {
                resolve(params);
            });
        })
}

/**
 *  添加中奖记录
 */
async function addTurnplateRecord(params) {
    return db.collection('game_zhuanpan_record')
        .add({
            data: {
                "_openid": params.openid,
                "brand": params.system.brand,
                "model": params.system.model,
                "platform": params.system.platform,
                "system": params.system.system,
                "prizeId": params.settings.data[params.index]._id,
                "zhuanpanId": params.zhuanpanId,
                "currentTime": new Date()
            }
        })
        .then(res => {
            console.log(res);
            console.log(params);
            return new Promise((resolve, reject) => {
                if (res.errMsg === "collection.add:ok") {
                    resolve({
                        "index": params.index,
                        "name": params.settings.data[params.index].name,
                        "rank": params.settings.data[params.index].rank,

                    })
                } else {
                    reject({
                        "errMsg": res.errMsg
                    })
                }
            });
        })
}

/**
 * 这个示例将经自动鉴权过的小程序用户 openid 返回给小程序端
 * 
 * event 参数包含小程序端调用传入的 data
 * 
 */
exports.main = async(event, context) => {
    // 可执行其他自定义逻辑
    // console.log 的内容可以在云开发云函数调用日志查看

    // 获取 WX Context (微信调用上下文)，包括 OPENID、APPID、及 UNIONID（需满足 UNIONID 获取条件）等信息
    const wxContext = cloud.getWXContext()

    //  游戏前的检查逻辑
    // const permission = await checkGamePermission(wxContext.OPENID);
    // if (!permission.result) {
    //     return {
    //         errMsg: permission.errMsg
    //     }
    // }
    const result = await checkGamePermission(wxContext.OPENID)
        .then(permission => {
            return new Promise((resolve, reject) => {
                if (permission.result) {
                    resolve({
                        zhuanpanId: permission.zhuanpanId,
                        openid: wxContext.OPENID,
                        event
                    })
                } else {
                    reject({
                        errMsg: permission.errMsg
                    })
                }
            })
        })
        .then(playTurnplate)
        .then(reducePrizeQuantity)
        .then(addTurnplateRecord)
        .catch(err => {
            return new Error(err.errMsg);
        })

    return result;
}