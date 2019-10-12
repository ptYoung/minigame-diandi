import Pool from './base/pool.js'

let instance;

/**
 *  全局状态管理器
 */
export default class DataBus {
    constructor() {
        if (instance)
            return instance;

        instance = this;

        this.pool = new Pool();

        this.reset();
    }

    /**
     *  重置
     */
    reset() {
        this.frame = 0;
        this.score = 0; //  得分
        this.bullets = []; //  子弹
        this.enemies = []; //  敌军
        this.animations = []; //  动画
        this.gameOver = false; //  游戏是否结束
        this.mainpages = []; //  索引页
        this.accelerometer = {
            x: 0,
            y: 0,
            z: 0
        }
    }

    /**
     * 
     */
    checkIsFingerInSpecificArea(e, area, callback, options) {
        // console.log('==== checkIsFingerInSpecificArea ====')
        if (e.touches && e.touches.length) {
            let x = e.touches[0].clientX;
            let y = e.touches[0].clientY;

            if (x >= area.startX &&
                x <= area.endX &&
                y >= area.startY &&
                y <= area.endY) { //  点击位置落入区域
                //  要么游戏结束，要么执意执行
                if (options || this.gameOver) {
                    callback();
                }
            }
        }
    }

    /**
     * 回收敌人，进入对象池
     * 此后不再进入帧循环
     */
    removeEnemy(enemy) {
        let temp = this.enemies.shift(); //  最先进入的先弹出
        temp.visible = false;
        this.pool.recycle('enemy', enemy);
    }

    /**
     * 回收子弹，进入对象池
     * 此后不再进入帧循环
     */
    removeBullet(bullet) {
        let temp = this.bullets.shift(); //  最先进入的先弹出
        temp.visible = false;
        this.pool.recycle('bullet', bullet);
    }
}