import Animation from '../../base/animation.js'
import DataBus from '../../databus.js'

const ENEMY_IMG_SRC = 'images/shooting/enemy.png';
const ENEMY_WIDTH = 60;
const ENEMY_HEIGHT = 60;

const __ = {
    speed: Symbol('speed')
}

let databus = new DataBus();

function randomX(start, end) {
    return Math.floor(Math.random() * (end - start) + start);
}

export default class Enemy extends Animation {
    constructor() {
        super(ENEMY_IMG_SRC, ENEMY_WIDTH, ENEMY_HEIGHT);
    }

    init(speed) {
        this.x = randomX(0, window.innerWidth - ENEMY_WIDTH);
        this.y = 0;
        this[__.speed] = speed;
        this.visible = true;

        this.initExplosionAnimation();
    }

    update() {
        this.y += this[__.speed];
        if (this.y > window.innerHeight + this.height) {
            databus.removeEnemy(this);
        }
    }

    initExplosionAnimation() {
        let frames = [];

        const BOOM_IMG_PREFIX = 'images/shooting/boom/explosion'
        const BOOM_FRAME_COUNT = 19;

        for (let i = 0; i < BOOM_FRAME_COUNT; i++) {
            frames.push(BOOM_IMG_PREFIX + (i + 1) + '.png');
        }

        this.initFrames(frames);
    }
}