import Animation from '../../base/animation.js'
import Helper from '../../base/helper.js'
import Databus from '../../databus.js'

const BASKETBALL_IMG_SRC = 'images/ball/basketball_1.png';
const BASKETBALL_WIDTH = 32;
const BASKETBALL_HEIGHT = 32;
const CONTROL_FACTOR_X = 8 / 5;
const CONTROL_FACTOR_Y = 5 / 8;
const MAX_FALL_DOWN = 3; //  触地反弹若干次后停止
const GAP = 0;
const COURT_X = 10; //  球场在画布内的视觉X坐标
const STEP = 0.05; //  篮球每次移动的偏移量
const HOOP_X = 248;
const HOOP_Y = 478;
const SCORE_WIDTH = 40;
const SCORE_HEIGHT = 40;

const __ = {
    speed: Symbol('speed')
}

let databus = new Databus();

export default class Basketball extends Animation {
    constructor(x = 0, y = 0, ratio_x = 1, ratio_y = 1, speed = 4) {
        super(BASKETBALL_IMG_SRC, BASKETBALL_WIDTH, BASKETBALL_HEIGHT, x, y)

        this.partition = 0; //  跟随贝塞尔曲线的阶段位置
        this.startX = x; //  初始X坐标
        this.startY = y; //  初始Y坐标
        this.hoop_x = HOOP_X * ratio_x;
        this.hoop_y = HOOP_Y * ratio_y;
        this[__.speed] = speed;
        this.fallDown = true;
        this.fallDownCount = 1;
    }

    /**
     * 旋转动画初始化
     */
    initRotateAnimation() {
        let frames = [];

        const BALL_IMG_PREFIX = 'images/ball/basketball_'
        const BALL_FRAME_COUNT = 4;

        for (let i = 0; i < BALL_FRAME_COUNT; i++) {
            frames.push(BALL_IMG_PREFIX + (i + 1) + '.png');
        }

        this.initFrames(frames);
        this.setAnimationInterval(3600 / 60);
    }

    /**
     * 检测投篮轨迹在合适的范围内变化
     */
    checkBallInScope(offsetX, offsetY, startX, startY, endX, endY) {
        // console.log('===== checkBallInScope >>>> ', offsetX, offsetY, startX, startY, endX, endY)
        if ((endX + offsetX > startX + BASKETBALL_WIDTH) && (endX + offsetX + BASKETBALL_WIDTH < canvas.width)) {
            endX += offsetX;
        }

        if ((endY + offsetY > startY + BASKETBALL_HEIGHT) && (endY + offsetY + BASKETBALL_HEIGHT < canvas.height)) {
            endY += offsetY;
        }

        return {
            x: endX,
            y: endY
        }
    }

    /**
     * 是否投进
     */
    scoreDetection(endX, endY) {
        return !!(endX >= this.hoop_x &&
            endX <= this.hoop_x + SCORE_WIDTH &&
            endY >= this.hoop_y &&
            endY <= this.hoop_y + SCORE_HEIGHT);
    }

    reset() {
        this.x = this.startX;
        this.y = this.startY;
    }

    update(endX, endY) {
        if (databus.frame % 5 === 0 && this.partition < 1) {
            //  根据贝塞尔曲线实时更新篮球位置
            let coordinate = Helper.getBezierCurve(
                this.partition,
                this.startX, this.startY,
                endX * CONTROL_FACTOR_X, endY * CONTROL_FACTOR_Y,
                endX, endY);
            this.x = coordinate.x;
            this.y = coordinate.y;
            this.partition += STEP;
        }

        if (!this.isPlaying) {
            //  开始播放旋转动画
            this.playAnimation(0, true);
        }

        //  沿着贝塞尔曲线变动结束
        if (this.partition >= 1) {


            // console.log(this.fallDown, this.x, this.fallDownCount);
            if (this.fallDown) {
                if (this.x > COURT_X) {
                    //  逐渐下落
                    this.x -= this[__.speed];
                } else {
                    //  反弹
                    this.fallDown = false;
                }
            } else if (!this.fallDown && this.fallDownCount <= MAX_FALL_DOWN) {
                if (this.x < endX / Math.pow(2, this.fallDownCount)) {
                    //  逐渐上升至 endX 一半位置
                    this.x += this[__.speed];
                } else {
                    //  下落
                    this.fallDown = true;
                    this.fallDownCount++;
                }
            } else if (this.fallDownCount > MAX_FALL_DOWN) {
                if (this.scoreDetection(endX, endY)) {
                    databus.score++;
                }
                //  停止播放旋转动画
                this.stop();
                //  显示篮球
                this.visible = true;
                //  结束游戏
                databus.gameOver = true;
                //  重置
                this.partition = 0;
                this.fallDownCount = 1;
            }
        }
    }
}