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

module.exports = {
    getNonceStr: getNonceStr,
    getBezierCurve: getBezierCurve
}