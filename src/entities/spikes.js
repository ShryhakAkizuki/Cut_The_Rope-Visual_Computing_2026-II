import { Sprites } from '../ui/sprites.js';
import { createMover } from './mover.js';
import { SPIKES_T } from '../data/config.js';

export class Spikes {

  constructor (x, y, size, angle, path, moveSpeed) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.angle = angle || 0;   // grados, como en el XML
    this.path = path;
    this.moveSpeed = moveSpeed;
    this.mover = createMover(x, y, path, moveSpeed);
    this.body = null;
  }

  get length () {
    return SPIKES_T.quadWidths[this.size - 1];
  }

  createBody () {
    this.body = Matter.Bodies.rectangle(this.x, this.y, this.length, SPIKES_T.bandHalfHeight * 2, {
      label: 'spikes',
      isStatic: true,
      isSensor: true,
      angle: this.angle * Math.PI / 180
    });
  }

  update (dt) {
    if (!this.mover) return;
    this.mover.update(dt / 1000);
    this.x = this.mover.pos.x;
    this.y = this.mover.pos.y;
    if (this.body) Matter.Body.setPosition(this.body, { x: this.x, y: this.y });
  }

  draw () {
    push();
    translate(this.x, this.y);
    rotate(this.angle * Math.PI / 180);
    Sprites.draw('obj_spikes', SPIKES_T.firstQuad + this.size - 1, 0, 0);
    pop();
  }
}
