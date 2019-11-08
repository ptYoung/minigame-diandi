// 云函数入口文件
const cloud = require('wx-server-sdk')
const axios = require('axios')
const CryptoJS = require('crypto-js')

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
 *  获取用户的SessionKey
 */
function getSessionKey(openid) {
    return new Promise((resolve, reject) => {
        db.collection("player")
            .doc(openid)
            .get()
            .then(res => {
                if (res.errMsg === "document.get:ok") {
                    resolve(res.data.sessionKey)
                } else {
                    reject(res.errMsg);
                }
            });
    });
}

// 云函数入口函数
exports.main = async(event, context) => {
    const interactiveData = {
        kv_list: [{
            key: "1",
            value: "100"
        }]
    };
    //  获取用户的SessionKey
    const key = await getSessionKey(event.openid);
    //  获取签名
    const signature = CryptoJS.HmacSHA256(JSON.stringify(interactiveData), key).toString();
    //  云调用 - 获取accessToken
    const result = await cloud.callFunction({
            name: "getAccessToken"
        })
        .then(token => {
            console.log(token);
            //  写用户关系链互动数据存储
            //  HTTPS 调用请求地址
            const URL = `https://api.weixin.qq.com/wxa/setuserinteractivedata?access_token=${token.result}&signature=${signature}&openid=${event.openid}&sig_method=hmac_sha256`;

            return new Promise((resolve, reject) => {
                axios.post(URL, interactiveData)
                    .then(res => {
                        console.log(res)
                        if (res.data && res.data.errcode === 0) {
                            resolve(res.data);
                        } else {
                            reject(res.data.errmsg);
                        }
                    })
            });
        })
        .catch(err => {
            errMsg: err
        })

    return result;
}