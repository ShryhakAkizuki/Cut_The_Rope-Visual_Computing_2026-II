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
    fill(COLORS.candy);
    circle(pos.x, pos.y, this.radius * 2);
  }

  // Como PointOutOfScreen de DX: margen vertical fijo y uno horizontal del ancho de VIEW.
  isOutOfMap (bounds) {
    if (!this.body) return false;
    const pos = this.body.position;
    return pos.y < bounds.y - TUNING.loseMarginTop
      || pos.y > bounds.y + bounds.h + TUNING.loseMarginBottom
      || pos.x < bounds.x - VIEW.w
      || pos.x > bounds.x + bounds.w + VIEW.w;
  }
}
