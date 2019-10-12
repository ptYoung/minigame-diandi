import Utils from './utils.js'

let sharedCanvas = wx.getSharedCanvas();
let sharedCanvasContext = sharedCanvas.getContext('2d');

let atlas = wx.createImage();
atlas.src = 'images/Common.png';

// 排行榜 KEY
const RANK_SCORE = "RANK_SCORE";
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

wx.getUserInteractiveStorage({
    keyList: ['1'],
    success: res => {
        console.log(res);
    },
    fail: err => {
        console.error(err);
    }
})

// wx.modifyFriendInteractiveStorage({
//     key: '1',
//     opNum: 1,
//     operation: 'add',
//     toUser: 'oW-3q5kpE6vI27rGdHO1tRJ5my9Y',
//     success: res => {
//         console.log(res);
//     },
//     fail: err => {
//         console.error(err);
//     }
// })

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
     * 绘制背景
     */
    drawBackground() {
        sharedCanvasContext.fillStyle = '#000000';
        sharedCanvasContext.fillRect(0, 0, sharedCanvas.width, sharedCanvas.height);
    }

    /**
     * 收到主屏发来的通知
     */
    addMessageListener() {
        wx.onMessage(data => {
            console.log(data);
            if (data.msgType === "GAME_OVER") {
                this.saveUserGameScore(data);
            } else if (data.msgType === "SHOW_RANKLIST") {
                if (!this.isShown) {
                    this.isShown = true;
                    this.getFriendsGameScores();
                }
            } else if (data.msgType === "SHARED_CANVAS_OFFSET") {
                this.offsetX = data.offsetX;
                this.offsetY = data.offsetY;
            } else if (data.msgType === "TERMINATE") {
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
                key: RANK_SCORE,
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
        wx.getFriendCloudStorage({
            keyList: [RANK_SCORE],
            success: res => {
                this.drawRankList(res.data);
            },
            fail: err => {
                console.error(err)
            }
        })
    }

}

new RankList().init()