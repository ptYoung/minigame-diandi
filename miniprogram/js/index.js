import Shooting from './shooting/main.js'
import Turnplate from './turnplate/main.js'
import Ball from './ball/main.js'
import Background from './base/background.js'
import DataBus from './databus.js'
import Utils from './base/helper.js'

let ctx = canvas.getContext('2d');
let databus = new DataBus();

//  开放数据域
let openDataContext = wx.getOpenDataContext();
//  开放数据域不能向主域发送消息，需要将业务场景绘制到sharedCanvas上，再在主域上渲染sharedCanvas
let sharedCanvas = openDataContext.canvas;

export default class Index {
    constructor() {
        //  维护当前requestAnimationFrame的id
        this.aniId = 0;
        //  登录 
        this.login();
        //  绘制
        this.restart();
        //  获取系统信息
        this.getSystemInfo();
    }

    /**
     *  登录
     */
    login() {
        Utils.login()
            //  准备云函数 login 的参数
            .then(res => {
                return new Promise((resolve, reject) => {
                    resolve({
                        name: "login",
                        data: {
                            code: res.code
                        }
                    })
                })
            })
            .then(Utils.callCloudFunction)
            .then(res => {
                console.log(res)
                //  获取登录用户openid
                window.openid = res.result.openid

                console.log(res.result.stats)

                if (res.result.stats.created === 1) {
                    //  首次登录
                    //  ....
                } else {
                    //  ....
                }

                //  获取场景值 
                const scenario = wx.getLaunchOptionsSync();
                console.log(scenario)
                //  单人聊天会话中的小程序消息卡片点击进入的场景
                if (scenario.scene === 1007 && scenario.query.user) {
                    //  初始化助力面板
                    openDataContext.postMessage({
                        msgType: "INIT",
                        panelClass: "Liker",
                        offsetX: (canvas.width - sharedCanvas.width) / 2,
                        offsetY: (canvas.height - sharedCanvas.height) / 2
                    });

                    //  发送消息至开放数据域，显示当前用户被点赞的历史记录
                    openDataContext.postMessage({
                        msgType: "OPEN",
                        panelClass: "Liker",
                        offsetX: (canvas.width - sharedCanvas.width) / 2,
                        offsetY: (canvas.height - sharedCanvas.height) / 2,
                        likeOpenid: scenario.query.user
                    });
                }
            })
            .catch(err => {
                console.error(err);
            })
    }

    /**
     *  获取系统信息
     */
    getSystemInfo() {
        wx.getSystemInfo({
            success(res) {
                console.log(res)
                databus.systemInfo = res;
            }
        })
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

    /**
     * 进入不同的游戏关卡
     */
    barrier(number) {
        this.end();
        if (number === 1) {
            new Shooting()
        } else if (number === 2) {
            new Turnplate()
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

        ctx.drawImage(sharedCanvas,
            (canvas.width - sharedCanvas.width) / 2,
            (canvas.height - sharedCanvas.height) / 2,
            sharedCanvas.width,
            sharedCanvas.height);

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