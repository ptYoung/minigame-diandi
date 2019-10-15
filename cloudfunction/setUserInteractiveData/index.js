// 云函数入口文件
const cloud = require('wx-server-sdk')

// 与小程序端一致，均需调用 init 方法初始化
cloud.init({
    // API 调用都保持和云函数当前所在环境一致
    env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async(event, context) => {
    const wxContext = cloud.getWXContext()

    const ret = cloud.openapi.storage.setUserInteractiveData({
        openid: wxContext.OPENID,
        kvList: [{
            key: '1',
            value: 0
        }]
    });

    return {
        event,
        ret,
        openid: wxContext.OPENID,
        appid: wxContext.APPID,
        unionid: wxContext.UNIONID,
    }
}