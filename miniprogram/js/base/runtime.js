const COMMON_IMG_SRC = 'images/Common.png';


export default class Runtime {
    constructor() {
        this.atlas = new Image();
        this.atlas.src = COMMON_IMG_SRC;

        this.screenWidth = window.innerWidth;
        this.screenHeight = window.innerHeight;

        this.btnBackHomeArea = {
            startX: 10,
            startY: 60,
            endX: 90,
            endY: 90
        }
    }

    renderBackHome(ctx) {
        ctx.drawImage(
            this.atlas,
            8, 168, 80, 30,
            10, 60, 80, 30
        )
    }

    renderGameScore(ctx, score, x = 10, y = 30) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '20px Arial';
        ctx.fillText(
            score,
            x,
            y
        );
    }
}