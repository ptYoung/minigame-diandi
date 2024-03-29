import Background from '../base/background.js'
import Helper from '../base/helper.js'
import GameInfo from './runtime/gameinfo.js'
import Pointer from './elements/pointer.js'
import Rotary from './elements/rotary.js'
import DataBus from '../databus.js'

let ctx = canvas.getContext('2d');
let databus = new DataBus();

export default class Main {
    constructor() {
        //  维护当前requestAnimationFrame的id
        this.aniId = 0;
        //  创建新Canvas
        this.newCanvas = wx.createCanvas();
        this.newCanvasContext = this.newCanvas.getContext('2d');
        this.newCanvasContext.translate(canvas.width / 2, canvas.height / 2);
        //  设置全局游戏状态
        databus.gameOver = true;
        //  添加对 touchstart 事件的响应句柄
        this.touchStartEventHandler = this.touchEventHandler.bind(this);
        canvas.addEventListener('touchstart', this.touchStartEventHandler);
        //  启动游戏
        this.init();
    }

    init() {
        this.bg = new Background();
        this.pointer = new Pointer();
        this.rotary = new Rotary();
        this.gameinfo = new GameInfo();
        this.bindLoop = this.loop.bind(this);

        ////    为什么要清除上一帧动画 
        window.cancelAnimationFrame(this.aniId);

        ////    开始帧循环
        this.aniId = window.requestAnimationFrame(
            this.bindLoop,
            canvas
        );
    }

    /**
     * 结束游戏
     */
    end() {
        console.log('===== End | ', this.aniId, ' =====');
        //  取消由 requestAnimationFrame 添加到计划中的动画帧请求。（仅支持在 WebGL 中使用）
        window.cancelAnimationFrame(this.aniId);
        //  移除触屏事件侦听
        canvas.removeEventListener('touchstart', this.touchStartEventHandler);
        //  暂停背景音乐
        // this.music.stopBgm();
        //  重置大转盘
        this.rotary.reset();
        //  清屏
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    /**
     * 回到首页
     */
    backHome() {
        this.end();
        databus.mainpage.restart();
    }

    /**
     * 邀请好友点赞助力
     * 带上自己的openid
     */
    inviteFriend() {
        console.log('==== invite friend ====', window.openid);
        wx.shareAppMessage({
            title: "小游戏转发测试",
            imageUrl: "images/bg.png",
            query: "user=" + window.openid
        })
    }

    /**
     * 触屏事件
     */
    touchEventHandler(e) {
        console.log("==== Lottery | TouchStart ====")
        //  取消事件的默认动作
        e.preventDefault();
        //  "邀请好友"
        databus.checkIsFingerInSpecificArea(
            e,
            this.gameinfo.btnInviteArea,
            this.inviteFriend.bind(this),
            true
        )
        //  "回到首页"
        databus.checkIsFingerInSpecificArea(
            e,
            this.gameinfo.btnBackHomeArea,
            this.backHome.bind(this),
            true
        )
        //  "大转盘"
        databus.checkIsFingerInSpecificArea(
            e,
            this.gameinfo.rotaryArea,
            this.rotary.restart.bind(this.rotary),
            true
        )
    }

    /**
     *  数据更新
     */
    update() {
        if (databus.gameOver)
            return;

        this.rotary.update(this.newCanvasContext);
    }

    /**
     *  重绘
     */
    render() {
        //  绘制背景
        this.bg.render(ctx);
        //  绘制大转盘
        this.rotary.render(this.newCanvasContext);
        ctx.drawImage(this.newCanvas, 0, 0);
        //  绘制转盘指针
        this.pointer.render(ctx);
        //  绘制附加功能
        this.gameinfo.renderInviteBtnArea(ctx);
        this.gameinfo.renderBackHome(ctx);
        //  游戏结束后，绘制游戏结果
        if (databus.gameOver) {
            if (databus.errMsg) {
                this.gameinfo.renderGameOver(ctx, databus.errMsg);
            } else if (databus.prize) {
                this.gameinfo.renderGameOver(ctx, databus.prize);
            }
        }
    }

    /**
     *  帧循环
     */
    loop() {
        databus.frame++;

        this.update();
        this.render();

        this.aniId = window.requestAnimationFrame(
            this.bindLoop,
            canvas
        );
    }
}