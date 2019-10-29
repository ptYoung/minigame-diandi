import Panel from './panel.js'
import Utils from './utils.js'

//  排行榜 KEY
const KEY_RANK_SCORE = "RANK_SCORE";

let instance;

export default class Ranking extends Panel {
    constructor(offsetX, offsetY) {
        super(offsetX, offsetY);

        if (instance)
            return instance;

        instance = this;
    }

    /**
     * 获取好友游戏分数
     */
    show() {
        if (this.isShown) {
            return;
        }

        this.isShown = true;
        //  拉取当前用户所有同玩好友的托管数据。该接口只可在开放数据域下使用
        wx.getFriendCloudStorage({
            keyList: [KEY_RANK_SCORE],
            success: res => {
                this.paint(res.data);
            },
            fail: err => {
                console.error(err)
            }
        })
    }

    /**
     * 绘制排行榜
     */
    paint(data) {
        this.init();

        data.forEach((item, index) => {
            console.log(item);

            if (item.KVDataList.length > 0) {
                // for (let i = 0; i < 10; i++, index++) {
                this.sharedCanvasContext.fillStyle = this.fontFillStyle;
                this.sharedCanvasContext.font = '13px Arial';
                this.sharedCanvasContext.fillText(
                    item.nickname,
                    this.leftBaseLine + this.avatarWidth + this.gapX,
                    this.contentBaseLine + (index * (this.avatarHeight + this.gapY)) + this.avatarHeight * 3 / 5
                );

                let score = JSON.parse(item.KVDataList[0].value).wxgame.score;
                this.sharedCanvasContext.font = '17px Arial';
                this.sharedCanvasContext.fillText(
                    score,
                    this.sharedCanvas.width - this.sharedCanvasContext.measureText(score).width + this.rightBaseLine,
                    this.contentBaseLine + (index * (this.avatarHeight + this.gapY)) + this.avatarHeight * 3 / 5
                );

                Utils.loadImage(index, item.avatarUrl).then(data => {
                    this.sharedCanvasContext.drawImage(
                        data.image,
                        this.leftBaseLine,
                        this.contentBaseLine + (data.index * (this.avatarHeight + this.gapY)),
                        this.avatarWidth,
                        this.avatarHeight);
                })

                Utils.loadImage(0, this.atlasSrc).then(data => {
                    this.sharedCanvasContext.drawImage(
                        data.image,
                        this.btnCloseLeft, this.btnCloseTop, this.btnCloseWidth, this.btnCloseHeight,
                        this.sharedCanvas.width - this.btnCloseWidth + this.rightBaseLine, this.topBaseLine,
                        this.btnCloseWidth, this.btnCloseHeight
                    )
                });
                // }
            }

        })
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

}