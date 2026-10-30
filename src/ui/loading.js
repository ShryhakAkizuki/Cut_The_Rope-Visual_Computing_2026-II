import { Sprites } from './sprites.js';
import { Fonts } from './fonts.js';
import { UI_T, VIEW } from '../data/config.js';

export class LoadingScreen {

  constructor () {
    this.shown = 0;
  }

  update (target) {
    this.shown += (target - this.shown) * UI_T.loaderLerp;
    if (target >= 1 && 1 - this.shown < 0.01) this.shown = 1;
  }

  get done () {
    return this.shown >= 1;
  }

  draw () {
    background(24, 16, 10);

    const bar = Sprites.quadSize('loaderbar_full', 0);
    const s = UI_T.loaderScale;
    const w = bar.w * s;
    const h = bar.h * s;
    const x = (VIEW.w - w) / 2;
    const y = VIEW.h / 2 + 40;

    noStroke();
    fill(0, 0, 0, 160);
    rect(x - 10, y - 10, w + 20, h + 20, (h + 20) / 2);
    fill(60, 45, 30);
    rect(x, y, w, h, h / 2);

    push();
    translate(x, y);
    scale(s);
    Sprites.drawQuad('loaderbar_full', 0, 0, 0, bar.w * this.shown);
    pop();

    if (Fonts.ttf) textFont(Fonts.ttf);
    textAlign(CENTER, CENTER);
    fill(255);
    textSize(110);
    text('Cargando...', VIEW.w / 2, VIEW.h / 2 - 110);
    textSize(50);
    fill(200);
    text(`${Math.round(this.shown * 100)} %`, VIEW.w / 2, y + h + 70);
    textAlign(LEFT, BASELINE);
    textFont('sans-serif');
  }
}
