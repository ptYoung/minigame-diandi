import Sprite from '../../base/sprite.js'
import DataBus from '../../databus.js'

const RATIO = 9 / 10;
const ROTARY_IMG_SRC = 'images/lottery/dazhuangpan.png';
const ROTARY_WIDTH = canvas.width * RATIO;
const ROTARY_HEIGHT = canvas.width * RATIO;

const MIN_SPEED = 1;
const MAX_SPEED = 7;
const STEP = 0.05;
const EASE_OUT = 4;

const BLOCK = 10;
const ANGLE = 360 / BLOCK;

let databus = new DataBus();

//  在调用云开发各 API 前，需先调用初始化方法 init 一次（全局只需一次，多次调用时只有第一次生效）
wx.cloud.init({
    // API 调用都保持和云函数当前所在环境一致
    env: wx.cloud.DYNAMIC_CURRENT_ENV
})

export default class Rotary extends Sprite {
    constructor() {
        super(ROTARY_IMG_SRC, ROTARY_WIDTH, ROTARY_HEIGHT);
        this.targetBlock = 0; //  目标区域
        this.compensate = 0; // 补偿弧度
    }

    /**
     *  重置
     */
    reset() {
        this.speed = MIN_SPEED; //  转速
        this.radian = 0; //  累计弧度
        this.last = 0; //  最后一环
        this.speedUp = true; //   是否加速中
        this.response = false; //   是否收到响应
        this.easeOut = EASE_OUT;
        databus.errMsg = '';
        databus.prize = '';
    }

    /**
     *  重新开始
     */
    restart() {
        console.log('===== restart =====', databus.gameOver, this.compensate)
        if (databus.gameOver) {
            this.reset();
        }

        this.play();

        //  模拟收到后台服务器的中奖结果消息
        // setTimeout(() => {
        //     this.response = true;
        //     //  目标区域
        //     this.targetBlock = 9;
        // }, 100);
    }

    play() {
        // 初始化 cloud
        console.log(databus.systemInfo);
        wx.cloud.callFunction({
                name: "playTurnplate",
                data: {
                    brand: databus.systemInfo.brand,
                    model: databus.systemInfo.model,
                    platform: databus.systemInfo.platform,
                    system: databus.systemInfo.system
                }
            })
            .then(res => {
                console.log(res);
                //  设置指针指向的目标区域
                if (res.result && res.result.index) {
                    //  开始转动大转盘
                    databus.gameOver = false;
                    //  设置中奖结果
                    this.targetBlock = res.result.index;
                    databus.prize = res.result.rank + ": " + res.result.name;
                } else {
                    console.error("错误: ", res.result.errMsg, res.result.defaultPrize);
                    // 显示错误信息
                    databus.errMsg = res.result.errMsg;
                }
                //  收到消息
                this.response = true;
            }).catch(err => {
                console.error(err)
                //  收到消息
                this.response = true;
            })
    }

    stop() {
        // console.log('===== stop =====', this.last, this.targetBlock * ANGLE)
        this.last += this.speed;
        if (this.last >= this.targetBlock * ANGLE) {
            this.speed = 0;
            this.compensate = 360 - this.last;
            databus.gameOver = true;
        }
    }

    update(ctx) {
        // console.log('===== update =====', this.radian, this.speed, this.compensate);
        //  加速阶段
        if (this.speedUp) {
            //  未达到最大速度，继续加速
            if (this.speed < MAX_SPEED) {
                this.speed += STEP;
                this.radian += this.speed;
            } else {
                //  否则，保持速度直到收到中奖结果通知
                if (this.response) {
                    //  开始减速
                    this.speedUp = false;
                    //  补偿弧度回归至初始状态
                    this.radian = 360 * EASE_OUT + (360 - this.radian % 360) + this.compensate;
                } else {
                    this.radian += this.speed;
                }
            }
        } else {
            //  逐渐减速阶段
            if (this.radian > this.speed) {
                this.radian -= this.speed;
                if (this.speed - 1 > MIN_SPEED && (this.radian < this.easeOut * 180)) {
                    this.easeOut /= 2;
                    this.speed--;
                }
            } else {
                //  转到指定区域
                this.speed = MIN_SPEED;
                this.stop();
            }
        }

        ctx.rotate(this.speed * Math.PI / 180)
    }

    render(ctx) {
        ctx.drawImage(
            this.img, -ROTARY_WIDTH / 2, -ROTARY_HEIGHT / 2,
            ROTARY_WIDTH,
            ROTARY_HEIGHT
        )
    }
}