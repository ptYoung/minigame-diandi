import Sprite from '../../base/sprite.js'
import Bullet from './bullet.js'
import DataBus from '../../databus.js'

const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight;

const PLAYER_IMG_SRC = 'images/shooting/hero.png';
const PLAYER_WIDTH = 80;
const PLAYER_HEIGHT = 80;

let instance;
let databus = new DataBus();

export default class Player extends Sprite {
    constructor() {
        super(PLAYER_IMG_SRC, PLAYER_WIDTH, PLAYER_HEIGHT);

        if (instance) {
            instance.reset();
            return instance;
        }

        instance = this;
        this.reset();

        wx.onAccelerometerChange(evt => {
            console.log('==== onAccelerometerChange ====')
            if (!this.touched) {
                this.moveHeroOnAccelerometerChanged(evt);
            }
        })
    }

    reset() {
        console.log('==== reset ====');
        this.x = screenWidth / 2 - this.width / 2;
        this.y = screenHeight - this.height - 30;

        this.touched = false; //  用于标识手指是否在英雄上
        this.bullets = [];
        this.initTouchEvent(); //  初始化事件监听
    }

    checkIsFingerOnHero(x, y) {
        const deviation = 30;

        return !!(x >= this.x - deviation &&
            y >= this.y - deviation &&
            x <= this.x + deviation + this.width &&
            y <= this.y + deviation + this.height);
    }

    moveHeroWithFinger(x, y) {
        let disX = x - this.width / 2
        let disY = y - this.height / 2

        if (disX < 0)
            disX = 0

        else if (disX > screenWidth - this.width)
            disX = screenWidth - this.width

        if (disY <= 0)
            disY = 0

        else if (disY > screenHeight - this.height)
            disY = screenHeight - this.height

        this.x = disX
        this.y = disY
    }

    moveHeroOnAccelerometerChanged(evt) {
        const factor = 20;

        let disX = this.x + (factor * evt.x);
        let disY = this.y - (factor * evt.y);

        if (!(disX <= 0 || (disX > screenWidth - this.width))) {
            this.x += (factor * evt.x);
        }

        if (!(disY <= 0 || (disY > screenHeight - this.height))) {
            this.y -= (factor * evt.y);
        }

        databus.accelerometer.x = this.x.toFixed(2);
        databus.accelerometer.y = this.y.toFixed(2);
        databus.accelerometer.z = evt.z.toFixed(2);

    }

    initTouchEvent() {
        console.log('==== add event listener ====');
        canvas.addEventListener('touchstart',
            this.touchStartEventHandler = this.touchHeroHandler.bind(this));
        canvas.addEventListener('touchmove',
            this.touchMoveEventHandler = this.touchHeroHandler.bind(this));
        canvas.addEventListener('touchend',
            this.touchEndEventHandler = this.touchHeroHandler.bind(this));

        // wx.onAccelerometerChange(evt => {
        //     console.log('==== onAccelerometerChange ====')
        //     if (!this.touched) {
        //         this.moveHeroOnAccelerometerChanged(evt);
        //     }
        // })
    }

    destroy() {
        console.log('==== destroy hero | remove event listener ====');
        canvas.removeEventListener('touchstart', this.touchStartEventHandler);
        canvas.removeEventListener('touchmove', this.touchMoveEventHandler);
        canvas.removeEventListener('touchend', this.touchEndEventHandler);

        // wx.offAccelerometerChange(evt => {
        //     console.log('==== offAccelerometerChange ====')
        //     console.log(evt);
        // })
    }

    shoot() {
        let bullet = databus.pool.getItemByClass('bullet', Bullet);

        bullet.init(
            this.x + this.width / 2 - bullet.width / 2,
            this.y - 10,
            10
        );

        databus.bullets.push(bullet);
    }

    touchHeroHandler(e) {
        //  取消事件的默认动作
        e.preventDefault();
        console.log("==== Hero | Touch ====")
        if (e.type === "touchstart") {
            let x = e.touches[0].clientX;
            let y = e.touches[0].clientY;

            if (this.checkIsFingerOnHero(x, y)) {
                this.touched = true;
                this.moveHeroWithFinger(x, y);
            }
        } else if (e.type === "touchmove") {
            let x = e.touches[0].clientX;
            let y = e.touches[0].clientY;
            if (this.touched) {
                this.moveHeroWithFinger(x, y);
            }
        } else if (e.type === "touchend") {
            this.touched = false;
        }
    }
}