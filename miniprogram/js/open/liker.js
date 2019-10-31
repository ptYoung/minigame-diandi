import Panel from './panel.js'
import Utils from './utils.js'

//  点赞助力 KEY
const KEY_LIKE = "1";

let instance;

/**
 *  点赞助力面板
 */
export default class Liker extends Panel {

    constructor(offsetX, offsetY) {
        super(offsetX, offsetY);

        if (instance)
            return instance;

        instance = this;

        this.btnLikeOffsetX = 120;
        this.btnLikeOffsetY = 6;
        this.btnLikeActualWidth = 39;
        this.btnLikeActualHeight = 24;
        this.btnLikeWidth = 120;
        this.btnLikeHeight = 40;
        this.btnLikeLeft = (this.sharedCanvas.width - this.btnLikeWidth) / 2;
        this.btnLikeTop = this.sharedCanvas.height / 2;

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

        //  侦听触屏事件
        this.subscribe('touchend', this.btnLikeClicked);

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
        })

        Utils.loadImage(0, this.atlasSrc).then(data => {
            this.sharedCanvasContext.drawImage(
                data.image,
                this.btnLikeOffsetX, this.btnLikeOffsetY, this.btnLikeActualWidth, this.btnLikeActualHeight,
                this.btnLikeLeft, this.btnLikeTop, this.btnLikeWidth, this.btnLikeHeight
            )
        });

        Utils.loadImage(0, this.atlasSrc).then(data => {
            this.sharedCanvasContext.drawImage(
                data.image,
                this.btnCloseLeft, this.btnCloseTop, this.btnCloseWidth, this.btnCloseHeight,
                this.sharedCanvas.width - this.btnCloseWidth + this.rightBaseLine, this.topBaseLine,
                this.btnCloseWidth, this.btnCloseHeight
            )
        });
    }

    /**
     *  点赞助力 
     */
    btnLikeClicked(args) {
        const that = args.self;

        if (args.clientX >= that.offsetX + that.btnLikeLeft &&
            args.clientX <= that.offsetX + that.btnLikeLeft + that.btnLikeWidth &&
            args.clientY >= that.offsetY + that.btnLikeTop - that.gapY &&
            args.clientY <= that.offsetY + that.btnLikeTop + that.btnLikeHeight + that.gapY) {
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
}