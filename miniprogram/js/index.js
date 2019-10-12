import Shooting from './shooting/main.js'
import Lottery from './lottery/main.js'
import Ball from './ball/main.js'
import Background from './base/background.js'
import DataBus from './databus.js'

let ctx = canvas.getContext('2d');

let databus = new DataBus();

export default class Index {
    constructor() {
        //  维护当前requestAnimationFrame的id
        this.aniId = 0;

        console.log(wx.getLaunchOptionsSync())

        // wx.showShareMenu({
        //     withShareTicket: true,
        //     success: res => {
        //         console.log(res);
        //     }
        // })

        // wx.onShareAppMessage(() => {
        //     return {
        //         title: "营销小游戏",
        //         imageUrl: "images/bg.png",
        //         query: "user=kyle"
        //     }
        // })

        this.restart();
    }

    /**
     * 开始
     */
    restart() {
        //  添加对 touchstart 事件的响应句柄
        this.touchStartEventHandler = this.touchEventHandler.bind(this);
        canvas.addEventListener('touchstart', this.touchStartEventHandler);

        this.bg = new Background();
        this.bindLoop = this.loop.bind(this);
        this.cleanUp = false;

        ////    清除上一帧，退出帧循环
        window.cancelAnimationFrame(this.aniId);
        ////    启动帧循环
        this.aniId = window.requestAnimationFrame(
            this.bindLoop,
            canvas
        );
    }

    /**
     * 关闭
     */
    end() {
        console.log('===== End | ', this.aniId, ' =====');
        //  取消由 requestAnimationFrame 添加到计划中的动画帧请求。（仅支持在 WebGL 中使用）
        window.cancelAnimationFrame(this.aniId);
        //  移除触屏事件侦听
        canvas.removeEventListener('touchstart', this.touchStartEventHandler);
        //  暂停背景音乐
        // this.music.stopBgm();
        //  清屏
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    barrier(number) {
        this.end();
        if (number === 1) {
            new Shooting()
        } else if (number === 2) {
            new Lottery()
        } else if (number === 3) {
            new Ball()
        }
    }

    touchEventHandler(e) {
        console.log("==== Index | TouchStart ====")
        //  取消事件的默认动作
        e.preventDefault();

        for (let i = 0; i < 3; i++) {
            databus.checkIsFingerInSpecificArea(
                e, {
                    startX: i * 50 + 40,
                    startY: 80,
                    endX: i * 50 + 40 + 20,
                    endY: 110
                },
                this.barrier.bind(this, i + 1),
                true
            )
        }
    }

    update() {
        // this.bg.update();
    }

    render() {
        this.bg.render(ctx);

        ctx.fillStyle = "#ffffff"
        ctx.font = "30px Arial"
        ctx.fillText('1', 50, 100)

        ctx.fillText('2', 100, 100)

        ctx.fillText('3', 150, 100)

        // newCanvasContext.drawImage(
        //     da, -IMG_DA_ZHUANG_PAN_WIDTH / 2, -IMG_DA_ZHUANG_PAN_HEIGTH / 2,
        //     IMG_DA_ZHUANG_PAN_WIDTH,
        //     IMG_DA_ZHUANG_PAN_HEIGTH
        // )

        // newCanvasContext.rotate(5 * Math.PI / 180)
        // ctx.drawImage(newCanvas, 0, 0);
    }

    loop() {
        ////   帧数加一
        databus.frame++;

        this.update();
        this.render();

        this.aniId = window.requestAnimationFrame(
            this.bindLoop,
            canvas
        );
    }
}