const cloud = require('wx-server-sdk')
const axios = require('axios')

// 初始化 cloud
cloud.init({
    // API 调用都保持和云函数当前所在环境一致
    env: cloud.DYNAMIC_CURRENT_ENV
})
//  可在入口函数外缓存 db 对象
const db = cloud.database()
//  数据库查询更新指令对象
const _ = db.command
//  参数
const AppID = "wxa0722dc1d331e6bf";
const AppSecret = "be070d3a6b94f44dd1185d6bcbb2ae3f";

/**
 *  更新用户的SessionKey
 */
function updateSessionKey(request) {
    return new Promise((resolve, reject) => {
        db.collection('player')
            .doc(request.openid)
            .set({
                data: {
                    sessionKey: request.session_key,
                    loginTime: new Date()
                }
            })
            .then(result => {
                console.log(result)
                if (result.errMsg === "document.set:ok") {
                    resolve({
                        errMsg: "OK",
                        stats: result.stats,
                        openid: result._id
                    })
                } else {
                    reject(result.errMsg);
                }
            })
    });
}

/**
 * 这个示例将经自动鉴权过的小程序用户 openid 返回给小程序端
 * 
 * event 参数包含小程序端调用传入的 data
 * 
 */
exports.main = async(event, context) => {
    console.log(event)

    // 可执行其他自定义逻辑
    // console.log 的内容可以在云开发云函数调用日志查看

    // 获取 WX Context (微信调用上下文)，包括 OPENID、APPID、及 UNIONID（需满足 UNIONID 获取条件）等信息
    // const wxContext = cloud.getWXContext()
    const code = event.code;

    const getSessionKeyUrl = `https://api.weixin.qq.com/sns/jscode2session?appid=${AppID}&secret=${AppSecret}&js_code=${code}&grant_type=authorization_code`
    const result = await axios.get(getSessionKeyUrl)
        .then(res => {
            console.log(res);
            return new Promise((resolve, reject) => {
                if (res.data.openid && res.data.session_key) {
                    resolve(res.data);
                } else {
                    reject(res.data.errmsg)
                }
            })
        })
        .then(updateSessionKey)
        .catch(err => {
            return {
                errMsg: err
            }
        });

    return result;
}