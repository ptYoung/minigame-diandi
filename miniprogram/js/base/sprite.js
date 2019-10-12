/**
 * 游戏基础精灵类
 */
export default class Sprite {
    constructor(imgSrc = '', width = 0, height = 0, x = 0, y = 0) {
        this.img = new Image();
        this.img.src = imgSrc;

        this.width = width;
        this.height = height;

        this.x = x;
        this.y = y;

        this.visible = true;
    }

    /**
     * 将精灵图绘制在画布上
     */
    drawToCanvas(ctx) {
        if (!this.visible)
            return;

        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }

    /**
     * 简单碰撞检测定义
     * 另一个精灵的中心点处于本精灵所在的矩形内
     */
    isCollideWith(sp) {
        let spX = sp.x + sp.width / 2;
        let spY = sp.y + sp.height / 2;

        if (!this.visible || !sp.visible)
            return false;

        return !!(spX >= this.x &&
            spX <= this.x + this.width &&
            spY >= this.y &&
            spY <= this.y + this.height);
    }
}