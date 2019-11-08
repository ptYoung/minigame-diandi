// 云函数入口文件
const cloud = require('wx-server-sdk')
const axios = require('axios')
const fs = require('fs')
const path = require('path')

// 初始化 cloud
cloud.init({
    // API 调用都保持和云函数当前所在环境一致
    env: cloud.DYNAMIC_CURRENT_ENV
})
//  参数
const AppID = "wxa0722dc1d331e6bf";
const AppSecret = "be070d3a6b94f44dd1185d6bcbb2ae3f";
const URL = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${AppID}&secret=${AppSecret}`

const tokenFileName = "global-access-token.json";
const tokenFilePath = path.join(__dirname, tokenFileName);

/**
 *  更新TOKEN
 */
function refreshAccessToken() {
    return new Promise((resolve, reject) => {
        axios(URL)
            .then(res => {
                console.log(res);
                //  写入临时文件
                fs.writeFile(
                    tokenFilePath,
                    JSON.stringify({
                        access_token: res.data.access_token,
                        expires: (res.data.expires_in * 1000) + Date.now()
                    }),
                    err => {
                        if (err) {
                            reject(err)
                        } else {
                            resolve(res.data.access_token)
                        }
                    }
                )
            })
            .catch(err => {
                reject(err);
            })
    });
}

/**
 *  从云端文件获取AccessToken
 *  如果Token已过期， 更新Token
 */
function getAccessToken() {
    return new Promise((resolve, reject) => {
        //  读取AccessToken
        fs.readFile(tokenFilePath, 'utf-8', (err, data) => {
            console.log(data);
            if (data) {
                try {
                    const accessTokenMsg = JSON.parse(data);
                    const {
                        access_token,
                        expires
                    } = accessTokenMsg
                    //  如果已过期，则更新Token
                    if (access_token && expires > Date.now()) {
                        resolve(access_token);
                    } else {
                        resolve(refreshAccessToken());
                    }
                } catch (err) {
                    reject(err);
                }
            } else {
                resolve(refreshAccessToken());
            }
        })
    });
}

// 云函数入口函数
exports.main = async(event, context) => {
    return await getAccessToken();
}