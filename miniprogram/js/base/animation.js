import Sprite from './sprite.js'
import DataBus from '../databus.js'

let databus = new DataBus();

const __ = {
    timer: Symbol('timer')
}

export default class Animation extends Sprite {
    constructor(imgSrc, width, height, x = 0, y = 0) {
        super(imgSrc, width, height, x, y);

        this.isPlaying = false; //  当前动画是否播放中
        this.loop = false; //  动画是否需要循环播放
        this.interval = 1000 / 60; ////  每一帧的时间间隔
        this[__.timer] = null; //  帧定时器 为什么要这么做，搞成数组
        this.index = -1; //  当前播放帧
        this.count = 0; //  总帧数
        this.imgList = []; //  帧图片集合
        // 推入到全局动画池里面，便于全局描图时遍历和绘制当前动画帧
        databus.animations.push(this);
    }

    initFrames(imgList) {
        imgList.forEach(imgSrc => {
            let img = new Image();
            img.src = imgSrc;
            this.imgList.push(img);
        })

        this.count = imgList.length;
    }

    // 将播放中的帧绘制到画布上
    aniRender(ctx) {
        // console.log('===== aniRender =====', this);
        ctx.drawImage(
            this.imgList[this.index],
            this.x,
            this.y,
            // this.width * 1.2,
            // this.height * 1.2
            this.width,
            this.height
        )
    }

    /**
     * 设置帧间隔
     */
    setAnimationInterval(interval) {
        this.interval = interval;
    }

    /**
     * 播放预定的帧动画
     */
    playAnimation(index = 0, loop = false) {
        //  动画播放时，敌机不再显示，播放帧动画的具体帧
        this.visible = false;
        this.isPlaying = true;
        this.loop = loop;
        this.index = index;

        if (this.interval > 0 && this.count > 0) {
            this[__.timer] = setInterval(
                this.frameLoop.bind(this),
                this.interval
            );
        }
    }

    /**
     * 停止帧动画
     */
    stop() {
        // console.log('==== stop ====', this.index)
        this.isPlaying = false;
        if (this[__.timer]) {
            clearInterval(this[__.timer]);
        }
    }

    /**
     * 帧遍历
     */
    frameLoop() {
        // console.log('===== frameLoop ======', this.index, this.loop)
        this.index++;

        if (this.index > this.count - 1) {
            if (this.loop) {
                this.index = 0;
            } else {
                this.index--;
                this.stop();
            }
        }
    }
}