import { VIEW, CAMERA_T } from '../data/config.js';

export class Camera {

  constructor () {
    this.y = 0;
    this.maxY = 0;
    this.panning = false;
    this.hurried = false;
    this.speed = 0;
    this.panDistance = 0;
    this.remaining = 0;
  }

  start (map, focus) {
    this.maxY = Math.max(0, map.h - VIEW.h);
    this.hurried = false;
    if (this.maxY === 0) {
      this.y = 0;
      this.panning = false;
      return;
    }
    this.y = focus.y > map.h / 2 ? 0 : this.maxY;
    this.panning = true;
    this.speed = CAMERA_T.panStartSpeed;
    this.panDistance = Math.abs(this.targetFor(focus) - this.y);
    this.remaining = this.panDistance;
  }

  targetFor (focus) {
    return Math.min(this.maxY, Math.max(0, focus.y - VIEW.h / 2));
  }

  get blocksInput () {
    return this.panning && this.remaining >= CAMERA_T.inputEnableDistance;
  }

  hurry () {
    if (this.panning) this.hurried = true;
  }

  update (dt, focus) {
    if (this.maxY === 0) return;
    const target = this.targetFor(focus);
    const d = target - this.y;

    if (!this.panning) {
      this.y += d * Math.min(1, CAMERA_T.followRate * dt);
      return;
    }

    const step = Math.sign(d) * this.speed * dt;
    this.y = Math.abs(step) >= Math.abs(d) ? target : this.y + step;
    this.remaining = Math.abs(target - this.y);

    if (this.hurried) {
      this.speed = Math.min(CAMERA_T.hurryMaxSpeed, this.speed * CAMERA_T.hurryFactor);
    } else if (this.remaining > this.panDistance / 2) {
      this.speed = Math.min(CAMERA_T.panMaxSpeed, this.speed + dt * CAMERA_T.panAcceleration);
    } else {
      this.speed = Math.max(CAMERA_T.panMinSpeed, this.speed - dt * CAMERA_T.panDeceleration);
    }
    if (this.remaining < 1) this.panning = false;
  }

  toWorld (p) {
    return { x: p.x, y: p.y + this.y };
  }
}
