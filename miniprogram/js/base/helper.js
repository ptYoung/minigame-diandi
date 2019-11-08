class Point {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
}
/**
 * 产生随机字符串
 * @param length
 * @returns {string}
 */
function getNonceStr(length) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const count = chars.length;
    let i, nonceStr = '';
    for (i = 0; i < length; i++) {
        nonceStr += chars.substr(Math.floor(Math.random() * (count - 1) + 1), 1);
    }
    return nonceStr;
}

/**
 * 返回贝塞尔曲线实时坐标
 */
function getBezierCurve(partition, startX, startY, controlX, controlY, endX, endY) {
    const tem = 1 - partition;
    return {
        x: tem * tem * startX + 2 * partition * tem * controlX + partition * partition * endX,
        y: tem * tem * startY + 2 * partition * tem * controlY + partition * partition * endY
    }; //返回坐标位置
}

/////////////////////////////////////////////////////////////////////////////////////
//                                      
//                              小游戏端API封装
//
/////////////////////////////////////////////////////////////////////////////////////

/**
 *  云函数
 */
function callCloudFunction(request) {
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            name: request.name,
            data: request.data,
            config: request.config,
            success: res => {
                resolve(res);
            },
            fail: err => {
                reject(err);
            }
        })
    })
}

/**
 *  登录 
 */
function login() {
    return new Promise((resolve, reject) => {
        wx.login({
            success: res => {
                if (res.errMsg === "login:ok") {
                    resolve(res);
                } else {
                    reject(res);
                }
            },
            fail: err => {
                reject(err);
            }
        })
    })
}

module.exports = {
    callCloudFunction: callCloudFunction,
    login: login,
    getNonceStr: getNonceStr,
    getBezierCurve: getBezierCurve
}