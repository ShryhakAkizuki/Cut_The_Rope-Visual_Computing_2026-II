import { Sprites } from './sprites.js';
import { VIEW, UI_T } from '../data/config.js';

export function pointInRect (px, py, x, y, w, h) {
  return px >= x && px <= x + w && py >= y && py <= y + h;
}

export function drawBoxCover (dim = 1) {
  const half = Sprites.quadSize('bgr_01_cover', 0);
  const mid = VIEW.w / 2;

  push();
  tint(255 * dim);
  Sprites.drawQuad('bgr_01_cover', 0, mid - half.w, 0);
  translate(mid + half.w / 2, VIEW.h / 2);
  rotate(PI);
  translate(-(mid + half.w / 2), -VIEW.h / 2);
  Sprites.drawQuad('bgr_01_cover', 0, mid, 0.5);
  pop();

  for (const quad of [6, 7]) {
    const f = Sprites.frame('menu_level_ui', quad);
    Sprites.drawQuad('menu_level_ui', quad, f.ox + UI_T.designOffsetX, 80);
  }
}

export function drawVeil (alpha) {
  noStroke();
  fill(0, 0, 0, alpha);
  rect(0, 0, VIEW.w, VIEW.h);
}
