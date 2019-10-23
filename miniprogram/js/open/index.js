import Utils from './utils.js'

let sharedCanvas = wx.getSharedCanvas();
let sharedCanvasContext = sharedCanvas.getContext('2d');

let atlas = wx.createImage();
atlas.src = 'images/Common.png';

//  排行榜 KEY
const KEY_RANK_SCORE = "RANK_SCORE";
//  点赞助力 KEY
const KEY_LIKE = "1";

/**
 * 排行榜设计要素
 */
const LEFT_BASE_LINE_X = 7;
const RIGHT_BASE_LINE_X = -15;
const HEAD_BASE_LINE_Y = 30;
const CONTENT_BASE_LINE_Y = 90;
const AVATAR_WIDTH = 24;
const AVATAR_HEIGHT = 24;
const GAP_X = 5;
const GAP_Y = 8;
const FONT_FILL_STYLE = '#ffffff';
const BTN_CLOSE_WIDTH = 15;
const BTN_CLOSE_HEIGHT = 15;
const BTN_CLOSE_TOP = 76;
const BTN_CLOSE_LEFT = 395;

class RankList {
    constructor() {
        this.offsetX = 0;
        this.offsetY = 0;
        this.isShown = false;
    }

    /**
     * 绘制
     */
    init() {
        this.addMessageListener();
    }

    /**
     * 销毁
     */
    destroy() {
        console.log('==== sharedCanvas | destory ====')
        //  清空整个画布
        sharedCanvasContext.clearRect(0, 0, sharedCanvas.width, sharedCanvas.height);
        this.isShown = false;
        //  移除触屏事件侦听
        wx.offTouchEnd(this.touchEndEventHandler);
    }


    /**
     * 收到主屏发来的通知
     */
    addMessageListener() {
        wx.onMessage(data => {
            console.log(data);
            if (data.msgType === "GAME_OVER") {
                //  游戏结束
                this.saveUserGameScore(data);
            } else if (data.msgType === "SHOW_RANKLIST") {
                //  排行榜
                if (!this.isShown) {
                    this.isShown = true;
                    this.getFriendsGameScores();
                }
            } else if (data.msgType === "LIKE") {
                //  点赞助力
                console.log("RECEIVE MSG >>> SELF OPENID: ", data.likeOpenid);
                window.likeOpenid = data.likeOpenid;
                // this.likeToMyFriend(data.toOpenid, data.opNum, data.operation);
                this.showLikeToMyFriendPanel(data.likeOpenid);
            } else if (data.msgType === "SHARED_CANVAS_OFFSET") {
                //  SharedCanvas 大小设置
                this.offsetX = data.offsetX;
                this.offsetY = data.offsetY;
            } else if (data.msgType === "TERMINATE") {
                //  销毁SharedCanvas
                this.destroy();
            }
        })
    }

    addTouchEventListener() {
        this.touchEndEventHandler = this.handleTouchEvent.bind(this);
        wx.onTouchEnd(this.touchEndEventHandler);
    }

    handleTouchEvent(e) {
        //  取消事件的默认动作
        console.log("==== sharedCanvas | TouchEnd ====")
        const clientX = e.changedTouches[0].clientX;
        const clientY = e.changedTouches[0].clientY;
        this.closeRankList(clientX, clientY);
        this.likeBtnClicked(clientX, clientY);
    }

    /**
     * 绘制排行榜背景
     */
    drawBackground() {
        sharedCanvasContext.fillStyle = '#000000';
        sharedCanvasContext.fillRect(0, 0, sharedCanvas.width, sharedCanvas.height);
    }

    /**
     * 绘制排行榜
     */
    drawRankList(data) {
        //  绘制背景
        this.drawBackground();
        //  添加触摸事件侦听
        this.addTouchEventListener();

        data.forEach((item, index) => {
            console.log(item);
            // for (let i = 0; i < 10; i++, index++) {
            sharedCanvasContext.fillStyle = FONT_FILL_STYLE;
            sharedCanvasContext.font = '13px Arial';
            sharedCanvasContext.fillText(
                item.nickname,
                LEFT_BASE_LINE_X + AVATAR_WIDTH + GAP_X,
                CONTENT_BASE_LINE_Y + (index * (AVATAR_HEIGHT + GAP_Y)) + AVATAR_HEIGHT * 3 / 5
            );

            let score = JSON.parse(item.KVDataList[0].value).wxgame.score;
            sharedCanvasContext.font = '17px Arial';
            sharedCanvasContext.fillText(
                score,
                sharedCanvas.width - sharedCanvasContext.measureText(score).width + RIGHT_BASE_LINE_X,
                CONTENT_BASE_LINE_Y + (index * (AVATAR_HEIGHT + GAP_Y)) + AVATAR_HEIGHT * 3 / 5
            );

            Utils.loadImage(index, item.avatarUrl).then(data => {
                // sharedCanvasContext.arc(10 + 25, 90 + 25, 25, 0, 2 * Math.PI);
                // sharedCanvas.clip()
                sharedCanvasContext.drawImage(
                    data.image,
                    LEFT_BASE_LINE_X,
                    CONTENT_BASE_LINE_Y + (data.index * (AVATAR_HEIGHT + GAP_Y)),
                    AVATAR_WIDTH,
                    AVATAR_HEIGHT);
            })

            sharedCanvasContext.drawImage(
                atlas,
                BTN_CLOSE_LEFT, BTN_CLOSE_TOP, BTN_CLOSE_WIDTH, BTN_CLOSE_HEIGHT,
                sharedCanvas.width - BTN_CLOSE_WIDTH + RIGHT_BASE_LINE_X,
                HEAD_BASE_LINE_Y,
                BTN_CLOSE_WIDTH, BTN_CLOSE_HEIGHT
            )
            // }
        })
    }

    /**
     * 关闭排行榜
     */
    closeRankList(x, y) {
        if (x >= this.offsetX + sharedCanvas.width - BTN_CLOSE_WIDTH + RIGHT_BASE_LINE_X &&
            x <= this.offsetX + sharedCanvas.width + RIGHT_BASE_LINE_X + GAP_X &&
            y >= this.offsetY + HEAD_BASE_LINE_Y - GAP_Y &&
            y <= this.offsetY + HEAD_BASE_LINE_Y + BTN_CLOSE_HEIGHT + GAP_Y) {
            console.log('=== closed ===');
            this.destroy();
        }
    }

    /**
     * 保存用户游戏分数
     */
    saveUserGameScore(data) {
        wx.setUserCloudStorage({
            KVDataList: [{
                key: KEY_RANK_SCORE,
                value: JSON.stringify({
                    "wxgame": {
                        "score": data.score,
                        "updateTime": data.updateTime
                    },
                    // "costTime": 365
                })
            }],
            success: res => {
                console.log(res);
            },
            fail: err => {
                console.error(err);
            }
        })
    }

    /**
     * 获取好友游戏分数
     */
    getFriendsGameScores() {
        //  拉取当前用户所有同玩好友的托管数据。该接口只可在开放数据域下使用
        wx.getFriendCloudStorage({
            keyList: [KEY_RANK_SCORE],
            success: res => {
                this.drawRankList(res.data);
            },
            fail: err => {
                console.error(err)
            }
        })
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     *  点赞助力 
     */
    likeBtnClicked(x, y) {
        if (x >= this.offsetX + sharedCanvas.width - BTN_CLOSE_WIDTH + RIGHT_BASE_LINE_X &&
            x <= this.offsetX + sharedCanvas.width + RIGHT_BASE_LINE_X + GAP_X &&
            y >= this.offsetY + HEAD_BASE_LINE_Y - GAP_Y &&
            y <= this.offsetY + HEAD_BASE_LINE_Y + BTN_CLOSE_HEIGHT + GAP_Y) {
            //  修改好友的互动型托管数据，该接口只可在开放数据域下使用
            //  用户确认内容配置： 
            //  文案通过 game.json 的 `modifyFriendInteractiveStorageConfirmWording' 字段配置
            //  配置内容可包含 nickname 变量，用 ${nickname} 表示，实际调用时会被替换成好友的昵称
            wx.modifyFriendInteractiveStorage({
                key: KEY_LIKE,
                //  opNum: 需要修改的数值，目前只能为 1
                opNum: 1,
                //  operation: 修改类型，目前只能为 add
                operation: 'add',
                // toUser: "oK1185SQJt0gTgmNwy4knHGQsVvE",
                toUser: window.likeOpenid,
                success: res => {
                    console.log(res);
                },
                fail: err => {
                    console.error(err);
                }
            })
        }
    }

    /**
     *  显示点击
     */
    showLikeToMyFriendPanel(selfOpenid) {
        wx.getFriendCloudStorage({
            keyList: [new Date().toDateString()],
            success: res => {
                console.log(res);

                const self = res.data.find(item => item.openid === selfOpenid);
                const myReceiveRecords = self && self.KVDataList.length ? self.KVDataList.find(record => record.key === new Date().toDateString()) : null;
                const myLikeArray = myReceiveRecords && myReceiveRecords.value ? JSON.parse(myReceiveRecords.value).receiveRecords : [];

                this.draw(myLikeArray);
            },
            fail: err => {
                console.error(err)
            }
        })
    }

    draw(data) {
        //  绘制背景
        this.drawBackground();
        //  添加触摸事件侦听
        this.addTouchEventListener();

        data.forEach((item, index) => {
            console.log(item);
            sharedCanvasContext.fillStyle = FONT_FILL_STYLE;
            sharedCanvasContext.font = '13px Arial';
            sharedCanvasContext.fillText(
                item.nickname,
                LEFT_BASE_LINE_X + AVATAR_WIDTH + GAP_X,
                CONTENT_BASE_LINE_Y + (index * (AVATAR_HEIGHT + GAP_Y)) + AVATAR_HEIGHT * 3 / 5
            );

            Utils.loadImage(index, item.avatarUrl).then(data => {
                // sharedCanvasContext.arc(10 + 25, 90 + 25, 25, 0, 2 * Math.PI);
                // sharedCanvas.clip()
                sharedCanvasContext.drawImage(
                    data.image,
                    LEFT_BASE_LINE_X,
                    CONTENT_BASE_LINE_Y + (data.index * (AVATAR_HEIGHT + GAP_Y)),
                    AVATAR_WIDTH,
                    AVATAR_HEIGHT);
            })

            sharedCanvasContext.drawImage(
                atlas,
                120, 6, 39, 24,
                sharedCanvas.width / 2 - 60,
                sharedCanvas.height / 2 - 100 + 180,
                120, 40
            )

            sharedCanvasContext.drawImage(
                atlas,
                BTN_CLOSE_LEFT, BTN_CLOSE_TOP, BTN_CLOSE_WIDTH, BTN_CLOSE_HEIGHT,
                sharedCanvas.width - BTN_CLOSE_WIDTH + RIGHT_BASE_LINE_X,
                HEAD_BASE_LINE_Y,
                BTN_CLOSE_WIDTH, BTN_CLOSE_HEIGHT
            )
        })
    }

}

new RankList().init()

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