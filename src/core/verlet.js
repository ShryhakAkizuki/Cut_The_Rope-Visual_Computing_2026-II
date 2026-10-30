import { ROPE_T, TUNING } from '../data/config.js';

const CONSTRAINT = {
  DISTANCE:      'DISTANCE',
  NOT_MORE_THAN: 'NOT_MORE_THAN',
  NOT_LESS_THAN: 'NOT_LESS_THAN',
};

export class VerletPoint {

  constructor (x, y, weight = 1) {
    this.pos = { x, y };
    this.prevPos = null;
    this.v = { x: 0, y: 0 };
    this.pin = null;
    this.constraints = [];
    this.setWeight(weight);
  }

  setWeight (weight) {
    this.weight = weight;
    this.invWeight = 1 / weight;
  }

  addConstraint (cp, restLength, type = CONSTRAINT.DISTANCE) {
    this.constraints.push({ cp, restLength, type });
  }

  constraintTo (cp) {
    return this.constraints.find((c) => c.cp === cp) || null;
  }

  removeConstraint (cp) {
    const i = this.constraints.findIndex((c) => c.cp === cp);
    if (i !== -1) this.constraints.splice(i, 1);
  }

  update (delta) {
    this.integrate(delta * delta, delta);
  }

  updateRopePart (delta) {
    this.integrate(delta * ROPE_T.qcpTimestep, delta);
  }

  integrate (accelerationScale, delta) {
    if (!this.prevPos) this.prevPos = { x: this.pos.x, y: this.pos.y };
    const dx = this.pos.x - this.prevPos.x;
    const dy = this.pos.y - this.prevPos.y + TUNING.gravityY * accelerationScale;
    this.v = { x: dx / delta, y: dy / delta };
    this.prevPos = { x: this.pos.x, y: this.pos.y };
    this.pos.x += dx;
    this.pos.y += dy;
  }

  applyImpulse (ix, iy, delta) {
    this.pos.x += ix * delta;
    this.pos.y += iy * delta;
  }

  satisfyConstraints () {
    if (this.pin) {
      this.pos.x = this.pin.x;
      this.pos.y = this.pin.y;
      return;
    }
    for (const c of this.constraints) {
      let dx = c.cp.pos.x - this.pos.x;
      let dy = c.cp.pos.y - this.pos.y;
      if (dx === 0 && dy === 0) {
        if (c.restLength === 0) continue;
        dx = 1;
        dy = 1;
      }
      const d = Math.hypot(dx, dy);
      if (c.type === CONSTRAINT.NOT_MORE_THAN && d <= c.restLength) continue;
      if (c.type === CONSTRAINT.NOT_LESS_THAN && d >= c.restLength) continue;

      const k = (d - c.restLength) / (Math.max(d, 1) * (this.invWeight + c.cp.invWeight));
      this.pos.x += dx * this.invWeight * k;
      this.pos.y += dy * this.invWeight * k;
      if (!c.cp.pin) {
        c.cp.pos.x -= dx * c.cp.invWeight * k;
        c.cp.pos.y -= dy * c.cp.invWeight * k;
      }
    }
  }
}
