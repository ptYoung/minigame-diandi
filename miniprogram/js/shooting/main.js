import Background from './runtime/background.js'
import GameInfo from './runtime/gameinfo.js'
import Music from './runtime/music.js'
import Hero from './player/hero.js'
import Enemy from './npc/enemy.js'
import DataBus from '../databus.js'

let ctx = canvas.getContext('2d');
let databus = new DataBus();

// wx.cloud.init({
//     // env 参数说明：
//     //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
//     //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
//     //   如不填则使用默认环境（第一个创建的环境）
//     // env: 'my-env-id',
// })
// const db = wx.cloud.database()

//  开放数据域
let openDataContext = wx.getOpenDataContext();
//  开放数据域不能向主域发送消息，需要将业务场景绘制到sharedCanvas上，再在主域上渲染sharedCanvas
let sharedCanvas = openDataContext.canvas;
//  sharedCanvas本质上是一个离屏Canvas，重设Canvas的宽高会清空Canvas上的内容
const FACTOR = 3 / 4;
sharedCanvas.width = canvas.width * FACTOR;
sharedCanvas.height = canvas.height * FACTOR;

export default class Main {
    constructor() {
        //  维护当前requestAnimationFrame的id
        this.aniId = 0;
        //  添加对 touchstart 事件的响应句柄
        this.touchStartEventHandler = this.touchEventHandler.bind(this);
        canvas.addEventListener('touchstart', this.touchStartEventHandler);
        openDataContext.postMessage({
            msgType: "SHARED_CANVAS_OFFSET",
            offsetX: (canvas.width - sharedCanvas.width) / 2,
            offsetY: (canvas.height - sharedCanvas.height) / 2
        });
        //  启动游戏
        this.restart();
        //  登录
        // this.login()

        wx.getUserInteractiveStorage({
            keyList: ['1'],
            success: res => {
                console.log(res);
            },
            fail: err => {
                console.error(err);
            }
        })
    }

    // login() {
    //     // 获取 openid
    //     wx.cloud.callFunction({
    //         name: 'login',
    //         success: res => {
    //             window.openid = res.result.openid
    //             this.prefetchHighScore()
    //         },
    //         fail: err => {
    //             console.error('get openid failed with error', err)
    //         }
    //     })
    // }

    // prefetchHighScore() {
    //     // 预取历史最高分
    //     db.collection('score').doc(`${window.openid}-score`).get()
    //         .then(res => {
    //             if (this.personalHighScore) {
    //                 if (res.data.max > this.personalHighScore) {
    //                     this.personalHighScore = res.data.max
    //                 }
    //             } else {
    //                 this.personalHighScore = res.data.max
    //             }
    //         })
    //         .catch(err => {
    //             console.error('db get score catch error', err)
    //             this.prefetchHighScoreFailed = true
    //         })
    // }

    restart() {
        databus.reset();
        //  每次重启时设置加速讲的帧间隔，否则停止加速计后再侦听 change 事件，间隔重置为默认值 Normal
        wx.startAccelerometer({
            interval: "game"
        })

        this.bg = new Background(ctx);
        this.music = new Music();
        this.hero = new Hero();
        this.gameinfo = new GameInfo();
        this.bindLoop = this.loop.bind(this);
        this.cleanUp = false;

        ////    清除上一帧动画 
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
        //  通知开放数据域销毁
        openDataContext.postMessage({
            msgType: "TERMINATE"
        });
        //  移除触屏事件侦听
        canvas.removeEventListener('touchstart', this.touchStartEventHandler);
        this.hero.destroy();
        //  暂停背景音乐
        this.music.stopBgm();
        //  停止加速计
        wx.stopAccelerometer();
        //  清屏
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    enemyGenerator() {
        if (databus.frame % 30 === 0) {
            let enemy = databus.pool.getItemByClass('enemy', Enemy);
            enemy.init(10);
            databus.enemies.push(enemy);
        }
    }

    collisionDetection() {
        let that = this;

        databus.bullets.forEach(bullet => {
            for (let i = 0, length = databus.enemies.length; i < length; i++) {
                let enemy = databus.enemies[i];

                if (!enemy.isPlaying && enemy.isCollideWith(bullet)) {
                    enemy.playAnimation();
                    that.music.playExplosion();

                    bullet.visible = false;
                    databus.score += 1;

                    break;
                }

            }
        });

        for (let i = 0, length = databus.enemies.length; i < length; i++) {
            if (this.hero.isCollideWith(databus.enemies[i])) {
                databus.gameOver = true;

                break;
            }
        }
    }

    // collisionDetection() {
    //     let that = this

    //     databus.bullets.forEach((bullet) => {
    //         for (let i = 0, il = databus.enemys.length; i < il; i++) {
    //             let enemy = databus.enemys[i]

    //             if (!enemy.isPlaying && enemy.isCollideWith(bullet)) {
    //                 enemy.playAnimation()
    //                 that.music.playExplosion()

    //                 bullet.visible = false
    //                 databus.score += 1

    //                 break
    //             }
    //         }
    //     })

    //     for (let i = 0, il = databus.enemys.length; i < il; i++) {
    //         let enemy = databus.enemys[i]

    //         if (this.player.isCollideWith(enemy)) {
    //             databus.gameOver = true

    //             // 获取历史高分
    //             if (this.personalHighScore) {
    //                 if (databus.score > this.personalHighScore) {
    //                     this.personalHighScore = databus.score
    //                 }
    //             }

    //             // 上传结果
    //             // 调用 uploadScore 云函数
    //             wx.cloud.callFunction({
    //                 name: 'uploadScore',
    //                 // data 字段的值为传入云函数的第一个参数 event
    //                 data: {
    //                     score: databus.score
    //                 },
    //                 success: res => {
    //                     if (this.prefetchHighScoreFailed) {
    //                         this.prefetchHighScore()
    //                     }
    //                 },
    //                 fail: err => {
    //                     console.error('upload score failed', err)
    //                 }
    //             })

    //             break
    //         }
    //     }
    // }

    /**
     * GameInfo类 显示排行榜
     */
    openRankList() {
        openDataContext.postMessage({
            msgType: "SHOW_RANKLIST"
        });
    }

    backHome() {
        this.end();
        databus.mainpage.restart();
    }

    touchEventHandler(e) {
        console.log("==== Gameinfo | TouchStart ====")
        //  取消事件的默认动作
        e.preventDefault();

        //  “重新开始”
        databus.checkIsFingerInSpecificArea(
            e,
            this.gameinfo.btnRestartArea,
            this.restart.bind(this),
            false
        )
        //  “排行榜”
        databus.checkIsFingerInSpecificArea(
            e,
            this.gameinfo.btnRankListArea,
            this.openRankList.bind(this),
            false
        )
        //  "回到首页"
        databus.checkIsFingerInSpecificArea(
            e,
            this.gameinfo.btnBackHomeArea,
            this.backHome.bind(this),
            true
        )
    }

    update() {
        if (databus.gameOver) {
            if (!this.cleanUp) {
                //  扫尾：发送游戏结束消息至开放数据区
                this.cleanUp = true;
                //  保存此次游戏记录
                openDataContext.postMessage({
                    msgType: "GAME_OVER",
                    score: databus.score,
                    updateTime: new Date().getTime()
                });
            }
            return;
        }

        this.bg.update();

        databus.bullets
            .concat(databus.enemies)
            .forEach(item => {
                item.update();
            })

        this.enemyGenerator();
        this.collisionDetection();

        if (databus.frame % 20 === 0) {
            this.hero.shoot();
            this.music.playShoot();
        }
    }

    render() {
        this.bg.render(ctx);
        this.gameinfo.renderGameScore(ctx, databus.score);
        this.gameinfo.renderBackHome(ctx);
        // this.gameinfo.renderAccelerometer(ctx, databus.accelerometer)
        this.hero.drawToCanvas(ctx);


        databus.animations.forEach(ani => {
            if (ani.isPlaying) {
                ani.aniRender(ctx);
            }
        })

        databus.bullets
            .concat(databus.enemies)
            .forEach(item => {
                item.drawToCanvas(ctx);
            })

        if (databus.gameOver) {
            this.gameinfo.renderGameOver(ctx, databus.score);
            ctx.drawImage(sharedCanvas,
                (canvas.width - sharedCanvas.width) / 2,
                (canvas.height - sharedCanvas.height) / 2,
                sharedCanvas.width,
                sharedCanvas.height);

            if (!this.cleanUp) {
                console.log('=== cleaning up ====');
                wx.stopAccelerometer(); //  停止加速计
                this.hero.destroy();
            }
        }
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

};