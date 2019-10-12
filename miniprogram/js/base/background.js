const SCREENWIDTH = window.innerWidth;
const SCREENHEIGHT = window.innerHeight;

export default class Background {
    constructor(imgSrc = 'images/bg.png', width = 640, height = 400, loop = true) {
        this.top = 0;
        this.loop = loop;
        this.img = new Image();
        this.img.src = imgSrc;
        this.bgImageWidth = width;
        this.bgImageHeight = height;
        this.aspectRatio = width / height;
    }

    update() {
        // this.top += SCREENWIDTH / this.aspectRatio;

        // if (this.top >= SCREENHEIGHT)
        //     this.top = 0;
    }

    render(ctx) {
        if (this.loop) {
            for (let y = 0; y < SCREENHEIGHT; y += SCREENWIDTH / this.aspectRatio) {
                ctx.drawImage(
                    this.img,
                    0, 0, this.bgImageWidth, this.bgImageHeight,
                    0, y, SCREENWIDTH, SCREENWIDTH / this.aspectRatio);
            }
        } else {
            ctx.drawImage(
                this.img,
                0, 0, this.bgImageWidth, this.bgImageHeight,
                0, 0, SCREENWIDTH, SCREENHEIGHT);
        }
    }
}