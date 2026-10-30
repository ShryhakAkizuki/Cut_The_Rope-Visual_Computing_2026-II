import { SPIKES_T } from '../data/config.js';

export class Mover {

  constructor (x, y, path, moveSpeed) {
    this.points = [{ x, y }];
    for (let i = 0; i + 1 < path.length; i += 2) {
      this.points.push({ x: x + path[i], y: y + path[i + 1] });
    }
    this.speed = (moveSpeed || 0) * SPIKES_T.moverSpeedScale;   // px/s de VIEW
    this.pos = { x, y };
    this.target = this.points.length > 1 ? 1 : 0;
    this.overrun = 0;
  }

  update (delta) {
    const n = this.points.length;
    if (n < 2 || this.speed <= 0) return;
    let time = delta + this.overrun;
    this.overrun = 0;
    let stalled = 0;
    while (time > 0) {
      const t = this.points[this.target];
      const dx = t.x - this.pos.x;
      const dy = t.y - this.pos.y;
      const dist = Math.hypot(dx, dy);
      if (dist <= 0) {
        this.target = (this.target + 1) % n;
        if (++stalled > n) break;
        continue;
      }
      stalled = 0;
      const timeToTarget = dist / this.speed;
      if (timeToTarget <= time) {
        this.pos = { x: t.x, y: t.y };
        time -= timeToTarget;
        this.target = (this.target + 1) % n;
        continue;
      }
      const step = this.speed * time / dist;
      this.pos = { x: this.pos.x + dx * step, y: this.pos.y + dy * step };
      time = 0;
    }
    if (time > 0) this.overrun = time;
  }
}

export function createMover (x, y, path, moveSpeed) {
  return Array.isArray(path) && path.length >= 2 ? new Mover(x, y, path, moveSpeed) : null;
}
