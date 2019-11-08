import Liker from './liker.js'
import Ranking from './ranking.js'

/**
 *  获取游戏次数
 * 
 *  -   每日游戏次数及好友赠送次数
 *  -   1. 无今日数据 无赠送数据
 *  -   2. 无今日数据 有赠送数据
 *  -   3. 有今日数据 无赠送数据
 *  -   4. 有今日数据 有赠送数据
 * 
 *  -   移除无关的历史数据
 */
function getMyGameNumber(key, callback) {
    wx.getUserCloudStorage({
        keyList: [key],
        success: res => {
            console.log(res);
            const numbersValue = res.KVDataList ? res.KVDataList.find(item => item.key === key) : null;
            const numbers = numbersValue ? JSON.parse(numbersValue.value) : [];
            // 移除无关的历史数据，即不是今日次数也不是赠送次数
            for (let i = 0; i < numbers.length; i++) {
                if (numbers[i].key !== "Permanent" && numbers[i].key !== new Date().toDateString()) {
                    numbers.splice(i, 1);
                }
            }

            console.log(numbers);

            // TODO:    修正我的游戏次数
            const ret1 = numbers.find(item => item.key === "Permanent");
            const ret2 = numbers.find(item => item.key === new Date().toDateString());
            console.log(ret1, ret2);

            let gameNumbers = {};

            if (ret1) {
                if (ret2) {
                    gameNumbers = {
                        "Permanent": ret1.value,
                        "Today": ret2.value
                    }
                } else {
                    gameNumbers = {
                        "Permanent": ret1.value,
                        "Today": 3
                    }
                }
            } else {
                if (ret2) {
                    gameNumbers = {
                        "Permanent": 0,
                        "Today": ret2.value
                    }
                } else {
                    gameNumbers = {
                        "Permanent": 0,
                        "Today": 3
                    }
                }
            }

            if (callback)
                callback(gameNumbers);

            //  TODO: 重置游戏次数
            wx.setUserCloudStorage({
                KVDataList: [{
                    key: key,
                    value: JSON.stringify([{
                        key: new Date().toDateString(),
                        value: gameNumbers.Today
                    }, {
                        key: "Permanent",
                        value: gameNumbers.Permanent
                    }])
                }],
                success: res => {
                    console.log(res);
                },
                fail: err => {
                    console.error(err);
                }
            })

        },
        fail: err => {
            console.error(err)
        }
    })


}

/**
 *  减少游戏次数
 *  -   优先扣减每日游戏次数
 *  -   不足时扣减好友赠送次数
 */
function reduceMyGameNumber(key) {
    wx.getUserCloudStorage({
        keyList: [key],
        success: res => {
            console.log(res);
            wx.setUserCloudStorage({
                KVDataList: [{
                    key: key,
                    value: JSON.stringify([{
                        key: new Date().toDateString(),
                        value: 3
                    }, {
                        key: "Permanent",
                        value: 0
                    }, {
                        key: "dump",
                        value: 2
                    }])
                }],
                success: res => {
                    console.log(res);
                },
                fail: err => {
                    console.error(err);
                }
            })
        },
        fail: err => {
            console.error(err)
        }
    })

}

class OpenDataContext {
    constructor() {
        this.rankingList = null;
        this.liker = null;
    }

    listen() {
        wx.onMessage(data => {
            console.log(data);

            /**
             * 初始化
             */
            if (data.msgType === "INIT") {
                if (data.panelClass === "Ranking") {
                    this.rankingList = new Ranking(data.offsetX, data.offsetY);
                } else if (data.panelClass === "Liker") {
                    this.liker = new Liker(data.offsetX, data.offsetY);
                }
            }

            /**
             *  打开面板
             */
            else if (data.msgType === "OPEN") {
                //  显示排行榜页面
                if (data.panelClass === "Ranking") {
                    this.rankingList.show();
                }
                //  显示助力页面
                else if (data.panelClass === "Liker") {
                    console.log("RECEIVE MSG >>> SELF OPENID: ", data.likeOpenid);
                    window.likeOpenid = data.likeOpenid;
                    this.liker.show(data.likeOpenid);
                }
            }

            /**
             * 游戏结束
             */
            else if (data.msgType === "GAME_OVER") {
                this.rankingList.saveUserGameScore(data);
            }

            /**
             *  销毁
             */
            else if (data.msgType === "TERMINATE") {
                //  销毁SharedCanvas
                this.rankingList.destroy();
            }

        })
    }
}

// wx.removeUserCloudStorage({
//     keyList: ["MY_TURNPLATE_NUMBER"],
//     success: res => {
//         console.log(res)
//     },
//     fail: err => {
//         console.error(err)
//     }
// })

// reduceMyGameNumber('MY_TURNPLATE_NUMBER');
// getMyGameNumber('MY_TURNPLATE_NUMBER', gameNumbers => {
//     console.log(gameNumbers)
// });

new OpenDataContext().listen();

// wx.getFriendCloudStorage({
//     keyList: [new Date().toDateString()],
//     success: res => {
//         console.log(res);
//         // this.drawRankList(res.data);
//     },
//     fail: err => {
//         console.error(err)
//     }
// })

// wx.getUserCloudStorage({
//     keyList: [new Date().toDateString()],
//     success: res => {
//         console.log(res);
//         // this.drawRankList(res.data);
//     },
//     fail: err => {
//         console.error(err)
//     }
// })

// console.log(new Date().toDateString())

// wx.modifyFriendInteractiveStorage({
//     key: KEY_LIKE,
//     //  opNum: 需要修改的数值，目前只能为 1
//     opNum: 1,
//     //  operation: 修改类型，目前只能为 add
//     operation: 'add',
//     // toUser: toOpenid,
//     toUser: "oK1185SQJt0gTgmNwy4knHGQsVvE",
//     success: res => {
//         console.log(res);
//     },
//     fail: err => {
//         console.error(err);
//     }
// })