import Dots from './elements/dots.js'
import Basketball from './elements/basketball.js'
import Player from './elements/player.js'
import GameInfo from './runtime/gameinfo.js'
import Helper from '../base/helper.js'
import Background from '../base/background.js'
import DataBus from '../databus.js'

/**
 *  球场
 */
const COURT_IMG_SRC = 'images/ball/court.png'
const COURT_IMG_WIDTH = 375;
const COURT_IMG_HEIGHT = 667;
const WINDOW_WIDTH = canvas.width;
const WINDOW_HEIGTH = canvas.height;
const RATIO_WIDTH = WINDOW_WIDTH / COURT_IMG_WIDTH;
const RATIO_HEIGHT = WINDOW_HEIGTH / COURT_IMG_HEIGHT;

/**
 *  球员
 */
const FACTOR = 1.5 * 320 / WINDOW_WIDTH; ///  缩小倍数，以屏幕宽度320为基准
const PLAYER_WIDTH = 230 / FACTOR;
const PLAYER_HEIGHT = 80 / FACTOR;
const PLAYER_X = 23 * RATIO_WIDTH;
const PLAYER_Y = 99 * RATIO_HEIGHT;

/**
 *  篮球
 */
const BALL_OFFSET = 24;

let ctx = canvas.getContext('2d');
let databus = new DataBus();

export default class Main {
    constructor() {
        //  维护当前requestAnimationFrame的id
        this.aniId = 0;
        //  投篮点坐标
        this.startX = PLAYER_X + PLAYER_WIDTH / 2 + BALL_OFFSET;
        this.startY = PLAYER_Y + PLAYER_HEIGHT - BALL_OFFSET;
        //  瞄准屏幕中央
        this.endX = WINDOW_WIDTH / 2;
        this.endY = WINDOW_HEIGTH / 2;
        this.touchX = 0; //  记录触屏点的X坐标   
        this.touchY = 0; //  记录触屏点的Y坐标   
        this.touched = false;
        //  设置全局游戏状态
        databus.reset();
        databus.gameOver = true;
        //  启动游戏
        this.init();
        //  添加对 touchstart 事件的响应句柄
        this.initTouchEvent();
    }

    init() {
        this.bg = new Background(COURT_IMG_SRC, COURT_IMG_WIDTH, COURT_IMG_HEIGHT, false);
        this.gameinfo = new GameInfo();
        this.player = new Player(PLAYER_WIDTH, PLAYER_HEIGHT, PLAYER_X, PLAYER_Y);
        this.player.initShootingAnimation();
        this.basketball = new Basketball(this.startX, this.startY, RATIO_WIDTH, RATIO_HEIGHT);
        this.basketball.initRotateAnimation();
        this.dots = new Dots(this.startX, this.startY, this.endX, this.endY);
        this.bindLoop = this.loop.bind(this);

        ////    清除上一帧动画 
        window.cancelAnimationFrame(this.aniId);
        ////    开始帧循环
        this.aniId = window.requestAnimationFrame(
            this.bindLoop,
            canvas
        );
    }

    initTouchEvent() {
        console.log('==== add event listener ====');
        canvas.addEventListener('touchstart',
            this.touchStartEventHandler = this.touchEventHandler.bind(this));
        canvas.addEventListener('touchmove',
            this.touchMoveEventHandler = this.touchEventHandler.bind(this));
        canvas.addEventListener('touchend',
            this.touchEndEventHandler = this.touchEventHandler.bind(this));
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
        canvas.removeEventListener('touchmove', this.touchMoveEventHandler);
        canvas.removeEventListener('touchend', this.touchEndEventHandler);
        //  暂停背景音乐
        // this.music.stopBgm();
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
     * 触屏事件
     */
    touchEventHandler(e) {
        console.log("==== Ball | Touch Event Handler ====")
        //  取消事件的默认动作
        e.preventDefault();

        if (e.type === "touchstart") {
            //  "回到首页"
            databus.checkIsFingerInSpecificArea(
                e,
                this.gameinfo.btnBackHomeArea,
                this.backHome.bind(this),
                true
            )

            //  判断游戏是否已经结束
            if (databus.gameOver) {
                //  计算起始触屏点坐标
                this.touchX = e.touches[0].clientX;
                this.touchY = e.touches[0].clientY;
                //  辅助线回归初始位置
                this.endX = WINDOW_WIDTH / 2;
                this.endY = WINDOW_HEIGTH / 2;
                //  触屏操作开始
                this.touched = true;
                //  开始游戏 
                databus.gameOver = false;
                //  回到持球姿势
                this.player.reset();
                //  篮球回归开始位置
                this.basketball.reset();
            }
        } else if (e.type === "touchmove") {
            let x = e.touches[0].clientX;
            let y = e.touches[0].clientY;
            if (this.touched) {
                let point = this.basketball.checkBallInScope(
                    x - this.touchX,
                    y - this.touchY,
                    this.startX, this.startY,
                    this.endX, this.endY);
                this.endX = point.x;
                this.endY = point.y;
                this.touchX = x;
                this.touchY = y;
            }
        } else if (e.type === "touchend") {
            if (this.touched) {
                this.touched = false;
                this.dots.destroy();
            }
        }
    }

    update() {
        // console.log('==== update ====', databus.gameOver)
        if (databus.gameOver)
            return;

        if (!databus.gameOver && !this.touched) {
            this.player.update();
            this.basketball.update(this.endX, this.endY);
        } else if (!databus.gameOver && this.touched) {
            this.dots.update(this.endX, this.endY);
        }
    }

    render() {
        //  绘制球场背影图
        this.bg.render(ctx);
        //  "回到首页"
        this.gameinfo.renderBackHome(ctx);
        this.gameinfo.renderGameScore(ctx, databus.score);
        //  绘制人物
        this.player.drawToCanvas(ctx);
        //  绘制篮球
        this.basketball.drawToCanvas(ctx);
        //  播放篮球旋转动画
        databus.animations.forEach(ani => {
            if (ani.isPlaying) {
                ani.aniRender(ctx);
            }
        })

        this.dots.render(ctx);

        // const HOOP_X = 248 * RATIO_WIDTH;
        // const HOOP_Y = 478 * RATIO_HEIGHT;
        // const SCORE_WIDTH = 40;
        // const SCORE_HEIGHT = 40;
        // ctx.fillRect(HOOP_X, HOOP_Y, SCORE_WIDTH, SCORE_HEIGHT)
    }

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