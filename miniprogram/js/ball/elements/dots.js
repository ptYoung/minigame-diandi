import Sprite from '../../base/sprite.js'
import Helper from '../../base/helper.js'

const DOT_IMG_SRC = 'images/ball/dot.png'
const DOT_WIDTH = 16;
const DOT_HEIGHT = 16;

const PARTITION = 7; //  将投篮轨迹切分成若干段
const COUNT = 6; //  要显示的辅助点个数 
const CONTROL_FACTOR_X = 8 / 5;
const CONTROL_FACTOR_Y = 5 / 8;

export default class Dots {
    constructor(startX, startY, endX, endY) {
        this.dots = [];
        this.startX = startX;
        this.startY = startY;
        this.endX = endX;
        this.endY = endY;

        this.init();
        this.reset();
    }

    init() {
        for (let i = COUNT; i >= 1; i--) {
            this.dots.push(new Sprite(
                DOT_IMG_SRC,
                DOT_WIDTH * 2 * i / 10,
                DOT_HEIGHT * 2 * i / 10));
        }
    }

    reset() {
        let index = 1;
        this.dots.forEach(item => {
            let coordinate = Helper.getBezierCurve(
                index / PARTITION,
                this.startX, this.startY,
                this.endX * CONTROL_FACTOR_X, this.endY * CONTROL_FACTOR_Y,
                this.endX, this.endY);

            item.x = coordinate.x;
            item.y = coordinate.y;
            item.visible = true;

            index++;
        });

    }

    destroy() {
        // console.log("==== dots destroy ====")
        this.dots.forEach(item => {
            item.visible = false;
        })
    }

    update(endX, endY) {
        // console.log('===== update =====', endX, endY);
        this.endX = endX;
        this.endY = endY;

        this.reset();
    }

    render(ctx) {
        this.dots.forEach(item => {
            item.drawToCanvas(ctx);
        })
    }

}