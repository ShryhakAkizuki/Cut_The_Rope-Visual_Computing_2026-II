class Button {

  constructor (x, y, w, h, label) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.label = label;
    this.enabled = true;
  }

  contains (px, py) {
    if (!this.enabled) return false;
    return pointInRect(px, py, this.x, this.y, this.w, this.h);
  }

  draw (mx, my) {
    const hover = this.contains(mx, my);

    strokeWeight(5);
    stroke(this.enabled ? 220 : 90);
    fill(!this.enabled ? 30 : hover ? 90 : 50);
    rect(this.x, this.y, this.w, this.h, 20);

    noStroke();
    fill(this.enabled ? 255 : 110);
    textSize(40);
    textAlign(CENTER, CENTER);
    text(this.label, this.x + this.w / 2, this.y + this.h / 2);
    textAlign(LEFT, BASELINE);
  }
}
