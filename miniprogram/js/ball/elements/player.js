import Animation from '../../base/animation.js'
import Databus from '../../databus.js'

const PLAYER_IMG_SRC = 'images/ball/curry_1.png'
const PLAYER_IMG_PREFIX = 'images/ball/curry_'
const PLAYER_FRAME_COUNT = 6;

let databus = new Databus();

export default class Player extends Animation {
    constructor(width, height, x = 20, y = 90) {
        super(PLAYER_IMG_SRC, width, height, x, y);

        this.finished = true; //  单次动画是否已结束
    }

    reset() {
        //  设置定格画面为第一帧
        this.img.src = PLAYER_IMG_SRC;
        this.finished = true;
    }

    /**
     * 旋转动画初始化
     */
    initShootingAnimation() {
        let frames = [];

        for (let i = 1; i <= PLAYER_FRAME_COUNT; i++) {
            frames.push(PLAYER_IMG_PREFIX + i + '.png');
        }

        this.initFrames(frames);
        this.setAnimationInterval(7200 / 60);
    }

    update() {
        // console.log('===== player update =====', this.isPlaying, databus.gameOver, this.finished);
        if (!databus.gameOver && !this.isPlaying) {
            if (this.finished) {
                this.finished = false;
                //  设置定格画面为最后一帧
                this.img.src = PLAYER_IMG_PREFIX + '6.png';
                //  开始播放旋转动画
                this.playAnimation(0);
            } else {
                //  显示球员
                this.visible = true;
            }
        }
    }
}