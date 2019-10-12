import Runtime from '../../base/runtime.js'

export default class GameInfo extends Runtime {
    constructor() {
        super();

        /**
         * 重新开始按钮区域
         * 方便简易判断按钮点击
         */
        this.btnRestartArea = {
            startX: this.screenWidth / 2 - 60,
            startY: this.screenHeight / 2 - 100 + 180,
            endX: this.screenWidth / 2 + 60,
            endY: this.screenHeight / 2 - 100 + 255
        }

        this.btnRankListArea = {
            startX: this.screenWidth / 2 - 60,
            startY: this.screenHeight / 2 - 100 + 120,
            endX: this.screenWidth / 2 + 60,
            endY: this.screenHeight / 2 - 100 + 165
        }
    }

    renderGameScore(ctx, score) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '20px Arial';
        ctx.fillText(
            score,
            10,
            30
        );
    }

    renderAccelerometer(ctx, accelerometer) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '20px Arial';
        ctx.fillText(
            'X: ' + accelerometer.x + ' Y: ' + accelerometer.y + ' Z: ' + accelerometer.z,
            10,
            60
        );
    }

    renderGameOver(ctx, score) {
        ctx.drawImage(this.atlas, 0, 0, 119, 108, this.screenWidth / 2 - 150, this.screenHeight / 2 - 100, 300, 300);

        ctx.fillStyle = "#ffffff"
        ctx.font = "20px Arial"

        ctx.fillText(
            '游戏结束',
            this.screenWidth / 2 - 40,
            this.screenHeight / 2 - 100 + 50
        )

        ctx.drawImage(
            this.atlas,
            120, 6, 39, 24,
            this.screenWidth / 2 - 60,
            this.screenHeight / 2 - 100 + 120,
            120, 40
        )

        ctx.fillText(
            '排行榜',
            this.screenWidth / 2 - 30,
            this.screenHeight / 2 - 100 + 145
        )

        ctx.drawImage(
            this.atlas,
            120, 6, 39, 24,
            this.screenWidth / 2 - 60,
            this.screenHeight / 2 - 100 + 180,
            120, 40
        )

        ctx.fillText(
            '重新开始',
            this.screenWidth / 2 - 40,
            this.screenHeight / 2 - 100 + 205
        )
    }
}