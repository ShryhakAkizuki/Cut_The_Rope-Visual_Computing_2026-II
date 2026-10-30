import { pointInRect } from './shapes.js';
import { Sprites } from './sprites.js';
import { Fonts } from './fonts.js';
import { UI_T } from '../data/config.js';

export class Button {

  constructor (x, y, w, h, label) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.label = label;
    this.enabled = true;
    this.visible = true;
  }

  contains (px, py) {
    if (!this.enabled || !this.visible) return false;
    return pointInRect(px, py, this.x, this.y, this.w, this.h);
  }

  get cx () { return this.x + this.w / 2; }
  get cy () { return this.y + this.h / 2; }

  centerAt (cx, cy) {
    this.x = cx - this.w / 2;
    this.y = cy - this.h / 2;
    return this;
  }

  draw (mx, my) {
    if (!this.visible) return;
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

export class SpriteButton extends Button {

  constructor (sheet, upFrame, downFrame, label = '', opts = {}) {
    const size = Sprites.quadSize(sheet, upFrame);
    super(0, 0, size.w, size.h, label);
    this.sheet = sheet;
    this.upFrame = upFrame;
    this.downFrame = downFrame === undefined ? upFrame : downFrame;
    this.font = opts.font || 'big';
    this.textScale = opts.textScale || 1;
    this.textOffsetY = opts.textOffsetY || 0;
    this.hoverScale = opts.hoverScale || 1;
  }

  draw (mx, my) {
    if (!this.visible) return;
    const hover = this.contains(mx, my);
    const s = hover ? this.hoverScale : 1;

    push();
    if (!this.enabled) tint(255, 110);
    translate(this.cx, this.cy);
    scale(s);
    Sprites.drawQuad(this.sheet, hover ? this.downFrame : this.upFrame, -this.w / 2, -this.h / 2);
    if (this.label) {
      Fonts.draw(this.font, this.label, 0, this.textOffsetY, {
        scale: this.textScale,
        maxWidth: this.w - UI_T.buttonTextPadding,
      });
    }
    pop();
  }
}
