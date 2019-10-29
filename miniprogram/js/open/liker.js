import Panel from './panel.js'
import Utils from './utils.js'

/**
 *  点赞助力面板
 */
export default class Liker extends Panel {

    constructor() {
        super();
    }

    /**
     *  初始化并显示面板
     * 
     *  selfOpenid  -  被点赞者的Openid
     */
    show(selfOpenid) {
        wx.getFriendCloudStorage({
            keyList: [new Date().toDateString()],
            success: res => {
                console.log(res);

                const self = res.data.find(item => item.openid === selfOpenid);
                const myReceiveRecords = self && self.KVDataList.length ? self.KVDataList.find(record => record.key === new Date().toDateString()) : null;
                const myLikeArray = myReceiveRecords && myReceiveRecords.value ? JSON.parse(myReceiveRecords.value).receiveRecords : [];

                this.paint(myLikeArray);
            },
            fail: err => {
                console.error(err)
            }
        })
    }

    /**
     *  绘制
     */
    paint(data) {
        this.init();

        data.forEach((item, index) => {
            console.log(item);
            this.sharedCanvasContext.fillStyle = this.fontFillStyle;
            this.sharedCanvasContext.font = '13px Arial';
            this.sharedCanvasContext.fillText(
                item.nickname,
                this.leftBaseLine + this.avatarWidth + this.gapX,
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

            this.sharedCanvasContext.drawImage(
                this.atlas,
                120, 6, 39, 24,
                this.sharedCanvas.width / 2 - 60,
                this.sharedCanvas.height / 2 - 100 + 180,
                120, 40
            )

            this.sharedCanvasContext.drawImage(
                this.atlas,
                this.btnCloseLeft, this.btnCloseTop, this.btnCloseWidth, this.btnCloseHeight,
                this.sharedCanvas.width - this.btnCloseWidth + this.btnCloseLeft,
                this.topBaseLine,
                this.btnCloseWidth, this.btnCloseHeight
            )
        })
    }

    /**
     *  点赞助力 
     */
    // likeBtnClicked(x, y) {
    //     if (x >= this.offsetX + this.sharedCanvas.width - BTN_CLOSE_WIDTH + RIGHT_BASE_LINE_X &&
    //         x <= this.offsetX + this.sharedCanvas.width + RIGHT_BASE_LINE_X + GAP_X &&
    //         y >= this.offsetY + HEAD_BASE_LINE_Y - GAP_Y &&
    //         y <= this.offsetY + HEAD_BASE_LINE_Y + BTN_CLOSE_HEIGHT + GAP_Y) {
    //         //  修改好友的互动型托管数据，该接口只可在开放数据域下使用
    //         //  用户确认内容配置： 
    //         //  文案通过 game.json 的 `modifyFriendInteractiveStorageConfirmWording' 字段配置
    //         //  配置内容可包含 nickname 变量，用 ${nickname} 表示，实际调用时会被替换成好友的昵称
    //         wx.modifyFriendInteractiveStorage({
    //             key: KEY_LIKE,
    //             //  opNum: 需要修改的数值，目前只能为 1
    //             opNum: 1,
    //             //  operation: 修改类型，目前只能为 add
    //             operation: 'add',
    //             // toUser: "oK1185SQJt0gTgmNwy4knHGQsVvE",
    //             toUser: window.likeOpenid,
    //             success: res => {
    //                 console.log(res);
    //             },
    //             fail: err => {
    //                 console.error(err);
    //             }
    //         })
    //     }
    // }
}