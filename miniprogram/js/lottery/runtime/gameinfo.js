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
            this. atlas,
            120, 6, 39, 24,
            100, 60, 120, 40
        )

        ctx.fillText(
            '邀请好友',
            120,
            85
        )
    }
}