import { Sprites } from '../ui/sprites.js';
import { createMover } from './mover.js';
import { STAR_RADIUS, CANDY_STAR_BOX, STAR_BOX, GFX_T } from '../data/config.js';

export class Star {

    constructor (x, y, path, moveSpeed) {
        this.x = x;
        this.y = y;
        this.radius = STAR_RADIUS;
        this.body = null;
        this.collected = false;
        this.mover = createMover(x, y, path, moveSpeed);
    }

    createBody () {}

    touches (pos) {
        return Math.abs(pos.x + CANDY_STAR_BOX.dx - (this.x + STAR_BOX.dx)) <= CANDY_STAR_BOX.hw + STAR_BOX.hw
            && Math.abs(pos.y + CANDY_STAR_BOX.dy - (this.y + STAR_BOX.dy)) <= CANDY_STAR_BOX.hh + STAR_BOX.hh;
    }

    update (dt) {
        if (!this.mover || this.collected) return;
        this.mover.update(dt / 1000);
        this.x = this.mover.pos.x;
        this.y = this.mover.pos.y;
    }

    draw () {
        if (this.collected) return;
        Sprites.draw('obj_star_idle', GFX_T.starGlowQuad, this.x, this.y);
        Sprites.draw('obj_star_idle', GFX_T.starQuad, this.x, this.y);
    }
}
