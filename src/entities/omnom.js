import { Sprites } from '../ui/sprites.js';
import { Animation } from '../ui/animation.js';
import { OMNOM_ANIMATION } from '../data/omnom-animation.js';
import { OMNOM_T, GFX_T } from '../data/config.js';

export class OmNom {

    constructor (x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.body = null;
        this.eaten = false;

        const sheet = Sprites.sheets[OMNOM_T.sheet];
        this.anim = sheet && sheet.img ? new Animation(OMNOM_ANIMATION, { image: sheet.img }) : null;
        if (this.anim) this.anim.play('idle');
    }

    createBody () {
        this.body = Matter.Bodies.circle(this.x, this.y + OMNOM_T.mouthOffsetY, OMNOM_T.mouthSensorRadius, {
            label: 'omnom',
            isStatic: true,
            isSensor: true
        });
    }

    openMouth () {
        if (!this.anim || this.eaten) return;
        this.anim.play('openMouth', { restart: false });
    }

    closeMouth () {
        if (!this.anim || this.eaten) return;
        if (this.anim.stateName !== 'idle') this.anim.play('idle');
    }

    eat () {
        this.eaten = true;
        if (this.anim) this.anim.play('eating');
    }

    update (dt) {
        if (this.anim) this.anim.update(dt);
    }

    draw () {
        Sprites.draw('char_supports', GFX_T.supportQuad, this.x, this.y);
        if (this.anim && this.anim.frame) {
            this.anim.draw(this.x, this.y + OMNOM_T.spriteOffsetY, OMNOM_T.spriteSize, OMNOM_T.spriteSize);
        }
    }
}
