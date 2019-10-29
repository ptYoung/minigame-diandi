/**
 * 发布者
 */
class Publisher {
    constructor() {
        this.topics = {};
        this.subscriberUid = -1;
    }

    /**
     *  发布事件
     */
    publish(topic, args) {
        //  没有人订阅该消息
        if (!this.topics[topic]) {
            return false;
        }

        let subscribers = this.topics[topic],
            length = subscribers ? subscribers.length : 0;

        //  通知订阅者处理事件
        while (length--) {
            subscribers[length].handle(args);
        }

        return true;
    }

    /**
     *  订阅事件
     */
    subscribe(topic, func) {
        //  没有人订阅该消息
        if (!this.topics[topic]) {
            this.topics[topic] = [];
        }

        this.topics[topic].push({
            token: (++this.subscriberUid).toString(),
            handle: func
        })

        return this.subscriberUid;
    }

    /**
     *  取消订阅
     */
    unsubscribe(token) {
        for (let topic in this.topics) {
            if (this.topics[topic]) {
                for (let i = 0, len = this.topics[topic].length; i < len; i++) {
                    if (this.topics[topic][i].token === token) {
                        this.topics[topic].splice(i, 1);
                        return token;
                    }
                }
            }
        }
    }
}

/**
 * 面板  -  基础类
 */
export default class Panel extends Publisher {
    constructor() {
        super();

        this.sharedCanvas = wx.getSharedCanvas();
        this.sharedCanvasContext = sharedCanvas.getContext('2d');
        this.leftBaseLine = 7; //  左边线偏移量
        this.rightBaseLine = -15; //  右边线偏移量
        this.topBaseLine = 30; //  上边线偏移量
        this.contentBaseLine = 90; //  内容区域

        this.atlas = wx.createImage(); //  加载所有控件图片
        this.atlas.src = 'images/Common.png';
        this.avatarWidth = 24; //  人物头像宽度
        this.avatarHeight = 24; //  人物头像高度
        this.gapX = 5; //  X轴间隔 有效点击区域比图片略大
        this.gapY = 9; //  Y轴间隔

        this.btnCloseWidth = 15; //  关闭按钮宽度
        this.btnCloseHeight = 15; //  关闭按钮高度
        this.btnCloseTop = 76; //  在Common.png中位置
        this.btnCloseLeft = 395;

        this.fontFillStyle = '#ffffff'; //  字体颜色

        this.offsetX = 0; //  在整个屏幕内的偏移量
        this.offsetY = 0;
        this.isShown = false; //  状态
    }

    /**
     * 绘制排行榜背景
     */
    drawBackground() {
        this.sharedCanvasContext.fillStyle = '#000000';
        this.sharedCanvasContext.fillRect(0, 0, this.sharedCanvas.width, this.sharedCanvas.height);
    }

    /**
     * 侦听触屏事件
     */
    addTouchEventListener() {
        this.touchEndEventHandler = this.handler.bind(this);
        wx.onTouchEnd(this.touchEndEventHandler);
    }

    /**
     * 触屏事件处理函数
     */
    handler(e) {
        //  取消事件的默认动作
        const clientX = e.changedTouches[0].clientX;
        const clientY = e.changedTouches[0].clientY;
        console.log("==== sharedCanvas | TouchEnd ====", clientX, clientY);
        this.publish('touchend', {
            self: this,
            clientX: clientX,
            clientY: clientY
        })
        // this.closeRankList(clientX, clientY);
        // this.likeBtnClicked(clientX, clientY);
    }

    /**
     * 销毁
     */
    destroy() {
        this.isShown = false;
        //  清空整个画布
        this.sharedCanvasContext.clearRect(0, 0, this.sharedCanvas.width, this.sharedCanvas.height);
        //  移除触屏事件侦听
        wx.offTouchEnd(this.touchEndEventHandler);
    }

    /**
     * 关闭 canvas
     */
    closePanel(args) {
        // console.log(this);
        // console.log(args);
        if (args.clientX >= args.self.offsetX + args.self.sharedCanvas.width - args.self.btnCloseWidth + args.self.rightBaseLine &&
            args.clientX <= args.self.offsetX + args.self.sharedCanvas.width + args.self.rightBaseLine + args.self.gapX &&
            args.clientY >= args.self.offsetY + args.self.topBaseLine - args.self.gapY &&
            args.clientY <= args.self.offsetY + args.self.topBaseLine + args.self.btnCloseHeight + args.self.gapY) {
            console.log('=== closed ===');
            args.self.destroy();
        }
    }

    /**
     *  初始化
     */
    init() {
        console.log("==== init panel ====");
        //  侦听触屏事件
        this.subscribe('touchend', this.closePanel);
        this.addTouchEventListener();
        //  绘制背景
        this.drawBackground();
    }
}