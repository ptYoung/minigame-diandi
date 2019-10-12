let instance;

export default class Music {
    constructor() {
        if (instance)
            return instance;

        instance = this;

        this.bgmAudio = new Audio();
        this.bgmAudio.loop = true;
        this.bgmAudio.src = 'audio/bgm.mp3';

        this.shootAudio = new Audio();
        this.shootAudio.src = 'audio/bullet.mp3';

        this.boomAudio = new Audio();
        this.boomAudio.src = 'audio/boom.mp3';

        this.playBgm();
    }

    playBgm() {
        this.bgmAudio.play();
    }

    playShoot() {
        this.shootAudio.currentTime = 0; //  设置或返回音频播放的当前位置（以秒计）
        this.shootAudio.play();
    }

    playExplosion() {
        this.boomAudio.currentTime = 0;
        this.boomAudio.play();
    }

    stopBgm() {
        this.bgmAudio.pause();
    }
}