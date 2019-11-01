const POINTER_IMG_SRC = 'images/lottery/zhizhen.png';
const POINTER_WIDTH = 100;
const POINTER_HEIGHT = 100;

export default class Pointer {
    constructor() {
        this.img = new Image();
        this.img.src = POINTER_IMG_SRC;
    }

    render(ctx) {
        ctx.drawImage(
            this.img,
            (canvas.width - POINTER_WIDTH) / 2,
            (canvas.height - POINTER_HEIGHT) / 2 - 20,
            POINTER_WIDTH,
            POINTER_WIDTH);
    }
}