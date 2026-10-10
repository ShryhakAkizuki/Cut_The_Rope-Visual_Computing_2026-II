class Candy {

  constructor (x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.body = null;
  }

  createBody () {
    this.body = Matter.Bodies.circle(this.x, this.y, this.radius, {
      label: 'candy',
      restitution: 0.3,
      frictionAir: 0.01,
      friction: 0.05
    });
  }

  draw () {
    if (!this.body) return;
    const pos = this.body.position;
    noStroke();
    fill(255, 120, 120);
    circle(pos.x, pos.y, this.radius * 2);
  }

  isOffscreen (w, h) {
    if (!this.body) return false;
    const pos = this.body.position;
    const m = this.radius;
    return pos.x < -m || pos.x > w + m || pos.y < -m || pos.y > h + m;
  }
}
