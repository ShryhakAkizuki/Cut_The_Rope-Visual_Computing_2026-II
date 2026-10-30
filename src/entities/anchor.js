import { Sprites } from '../ui/sprites.js';
import { ANCHOR_RADIUS } from '../data/config.js';

export class Anchor {

    constructor (x, y, chain = false) {
        this.x = x;
        this.y = y;
        this.chain = chain;
        this.body = null;
        this.sheet = chain ? 'obj_hook_chain' : 'obj_hook';
        this.backFrame = chain ? 0 : (Math.random() < 0.5 ? 0 : 2);
    }

    createBody () {
        this.body = Matter.Bodies.circle(this.x, this.y, ANCHOR_RADIUS, {
            label: 'anchor',
            isStatic: true,
            isSensor: true
        });
    }

    draw () {
        if (!this.body) return;
        const pos = this.body.position;
        Sprites.draw(this.sheet, this.backFrame, pos.x, pos.y);
    }

    drawFront () {
        if (!this.body) return;
        const pos = this.body.position;
        Sprites.draw(this.sheet, this.backFrame + 1, pos.x, pos.y);
    }
}
