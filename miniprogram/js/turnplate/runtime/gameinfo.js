import Runtime from '../../base/runtime.js'

export default class GameInfo extends Runtime {
    constructor() {
        super();

        /**
         * 重新开始按钮区域
         * 方便简易判断按钮点击
         */
        this.btnInviteArea = {
            startX: 100,
            startY: 60,
            endX: 220,
            endY: 100
        }

        this.rotaryArea = {
            startX: this.screenWidth / 2 - 100,
            startY: this.screenHeight / 2 - 100,
            endX: this.screenWidth / 2 + 100,
            endY: this.screenHeight / 2 + 100,
        }
    }

    /**
     * 邀请好友 
     */
    renderInviteBtnArea(ctx) {
        ctx.fillStyle = "#ffffff"
        ctx.font = "20px Arial"

        ctx.drawImage(
            this.atlas,
            120, 6, 39, 24,
            100, 60, 120, 40
        )

        ctx.fillText(
            '邀请好友',
            120,
            85
        )
    }

    /**
     *  绘制结果
     */
    renderGameOver(ctx, result) {
        ctx.drawImage(
            this.atlas,
            0, 0, 119, 108,
            this.screenWidth / 2 - 150, this.screenHeight / 2 - 100, 300, 300);

        ctx.fillStyle = "#ffffff"
        ctx.font = "20px Arial"

        ctx.fillText(
            '游戏结束',
            this.screenWidth / 2 - 40,
            this.screenHeight / 2 - 100 + 50
        )

        ctx.fillText(
            result,
            this.screenWidth / 2 - 30,
            this.screenHeight / 2 - 100 + 145
        )

        // ctx.drawImage(
        //     this.atlas,
        //     120, 6, 39, 24,
        //     this.screenWidth / 2 - 60,
        //     this.screenHeight / 2 - 100 + 180,
        //     120, 40
        // )

        // ctx.fillText(
        //     '重新开始',
        //     this.screenWidth / 2 - 40,
        //     this.screenHeight / 2 - 100 + 205
        // )
    }
}