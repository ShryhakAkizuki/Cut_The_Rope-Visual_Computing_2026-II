import { VerletPoint } from '../core/verlet.js';
import { Sprites } from '../ui/sprites.js';
import { SPIKES_T, GFX_T, TUNING, VIEW } from '../data/config.js';

export class Candy {

  constructor (x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.body = null;
    this.point = null;
    this.broken = null;
    this.eaten = false;
  }

  createBody () {
    this.point = new VerletPoint(this.x, this.y, 1);
    this.body = Matter.Bodies.circle(this.x, this.y, this.radius, {
      label: 'candy',
      isSensor: true,
      frictionAir: 0
    });
  }

  syncBody () {
    Matter.Body.setPosition(this.body, this.point.pos);
    Matter.Body.setVelocity(this.body, { x: 0, y: 0 });
  }

  shatter () {
    const T = SPIKES_T;
    const pos = this.body.position;
    const spread = (v) => (Math.random() * 2 - 1) * v;
    const pieces = [];
    for (let i = 0; i < T.breakPieces; i++) {
      const a = (T.breakAngle + spread(T.breakAngleVar)) * Math.PI / 180;
      const speed = T.breakSpeed + spread(T.breakSpeedVar);
      pieces.push({
        frame: T.breakFirstQuad + Math.floor(Math.random() * (T.breakLastQuad - T.breakFirstQuad + 1)),
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        spin: spread(T.breakRotateSpeedVar),   // grados/s
      });
    }
    this.broken = { x: pos.x, y: pos.y, start: millis(), pieces };
  }

  isBreaking () {
    return !!this.broken && millis() - this.broken.start < SPIKES_T.breakLoseDelay * 1000;
  }

  drawBroken () {
    const b = this.broken;
    const t = (millis() - b.start) / 1000;
    if (t >= SPIKES_T.breakLife) return;
    for (const p of b.pieces) {
      const f = Sprites.frame('obj_candy_01_new', p.frame);
      if (!f) continue;
      push();
      translate(b.x + p.vx * t, b.y + p.vy * t + 0.5 * SPIKES_T.breakGravityY * t * t);
      rotate(p.spin * t * Math.PI / 180);
      Sprites.draw('obj_candy_01_new', p.frame, 0, 0, {
        ax: (f.ox + f.w / 2) / f.sw,
        ay: (f.oy + f.h / 2) / f.sh,
      });
      pop();
    }
  }

  hide () {
    this.eaten = true;
  }

  draw () {
    if (this.eaten) return;
    if (this.broken) {
      this.drawBroken();
      return;
    }
    if (!this.body) return;
    const pos = this.body.position;
    push();
    translate(pos.x, pos.y);
    scale(GFX_T.candyScale);
    for (const q of GFX_T.candyQuads) Sprites.draw('obj_candy_01_new', q, 0, 0);
    pop();
  }

  isOutOfMap (bounds) {
    if (!this.body) return false;
    const pos = this.body.position;
    return pos.y < bounds.y - TUNING.loseMarginTop
      || pos.y > bounds.y + bounds.h + TUNING.loseMarginBottom
      || pos.x < bounds.x - VIEW.w
      || pos.x > bounds.x + bounds.w + VIEW.w;
  }
}
