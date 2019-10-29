import Liker from './liker.js'
import Ranking from './ranking.js'

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