import { Sprites } from './sprites.js';
import { Fonts } from './fonts.js';
import { Animation } from './animation.js';
import { SpriteButton } from './button.js';
import { SoundToggle } from './overlays.js';
import { drawVeil } from './shapes.js';
import { CREDITS } from '../data/credits.js';
import { OMNOM_ANIMATION } from '../data/omnom-animation.js';
import { MENU_T, VIEW, OMNOM_T, GFX_T, TUNING, SOUND_BUTTON_T } from '../data/config.js';

export function drawMenuBackdrop (front) {
  const T = MENU_T;
  background(0);

  push();
  translate(VIEW.w / 2, VIEW.h);
  scale(T.bgrScale);
  Sprites.draw('menu_bgr', 0, 0, 0, { ax: 0.5, ay: 1 });
  if (front) Sprites.draw('menu_bgr', 1, 0, 0, { ax: 0.5, ay: 1 });
  pop();

  const t = (millis() / 1000) % T.shadowPeriod;
  push();
  translate(VIEW.w / 2, VIEW.h / 2);
  rotate(radians(T.shadowStartDeg + 360 * t / T.shadowPeriod));
  scale(T.shadowScale);
  Sprites.draw('menu_bgr_shadow', 0, 0, 0);
  pop();
}

export function drawScreenFade (since) {
  const k = 1 - (millis() - since) / MENU_T.fadeMs;
  if (k > 0) drawVeil(255 * k);
}

export function createBackButton () {
  const b = new SpriteButton('menu_extra_buttons', MENU_T.backQuadUp, MENU_T.backQuadDown);
  b.x = 0;
  b.y = VIEW.h - b.h;
  return b;
}

export class TitleScreen {

  constructor () {
    const T = MENU_T;
    this.buttons = {
      play:    new SpriteButton('menu_buttons', 0, 1, 'Jugar'),
      credits: new SpriteButton('menu_buttons', 0, 1, 'Créditos'),
    };
    const list = Object.values(this.buttons);
    const h = list[0].h;
    let y = VIEW.h - T.buttonsBottom - list.length * h - (list.length - 1) * T.buttonGap + h / 2;
    for (const b of list) {
      b.centerAt(VIEW.w / 2, y);
      y += h + T.buttonGap;
    }

    this.soundToggle = new SoundToggle();
    this.soundToggle.x = SOUND_BUTTON_T.menuMargin;
    this.soundToggle.y = SOUND_BUTTON_T.menuMargin;
  }

  draw (pointer) {
    drawMenuBackdrop(true);

    push();
    translate(VIEW.w / 2, MENU_T.logoY);
    scale(MENU_T.logoScale);
    Sprites.draw('cut_the_rope_logo', 0, 0, 0, { ax: 0.5, ay: 0 });
    pop();

    for (const b of Object.values(this.buttons)) b.draw(pointer.x, pointer.y);
    this.soundToggle.draw(pointer.x, pointer.y);
  }
}

export class CreditsScreen {

  constructor () {
    this.backButton = createBackButton();
    const sheet = Sprites.sheets[OMNOM_T.sheet];
    this.omnom = sheet && sheet.img ? new Animation(OMNOM_ANIMATION, { image: sheet.img }) : null;
  }

  draw (pointer) {
    const T = MENU_T;
    drawMenuBackdrop(false);

    const popup = Sprites.quadSize('menu_popup', 0);
    const pw = popup.w * T.popupScale;
    const ph = popup.h * T.popupScale;
    const cx = VIEW.w / 2;
    const top = T.popupCenterY - ph / 2;
    const inner = pw - 160;

    push();
    translate(cx, T.popupCenterY);
    scale(T.popupScale);
    Sprites.drawCentered('menu_popup', 0, 0, 0);
    pop();

    Fonts.draw('big', CREDITS.title, cx, top + 120, { scale: T.titleScale, maxWidth: inner });
    Fonts.draw('big', CREDITS.course, cx, top + 225, { scale: T.courseScale, maxWidth: inner });
    Fonts.draw('big', CREDITS.heading, cx, top + 345, { scale: T.headingScale, maxWidth: inner });
    this.drawNames(CREDITS.students, cx, top + 420, top + ph - 230, pw);

    let fy = top + ph - 165;
    for (const line of CREDITS.footer) {
      Fonts.draw('big', line, cx, fy, { scale: T.footerScale, maxWidth: inner });
      fy += 60;
    }

    Sprites.draw('char_supports', GFX_T.supportQuad, T.omnomX, T.omnomY);
    if (this.omnom) {
      this.omnom.update(Math.min(deltaTime, TUNING.maxFrameDeltaMs));
      this.omnom.draw(T.omnomX, T.omnomY + OMNOM_T.spriteOffsetY, OMNOM_T.spriteSize, OMNOM_T.spriteSize);
    }

    this.backButton.draw(pointer.x, pointer.y);
  }

  drawNames (names, cx, y0, y1, pw) {
    const T = MENU_T;
    if (names.length === 0) return;
    const cols = names.length >= T.nameColumnsFrom ? 2 : 1;
    const rows = Math.ceil(names.length / cols);
    const rowH = Math.min(T.nameRowMax, (y1 - y0) / rows);
    const s = T.nameScale * rowH / T.nameRowMax;
    const colW = (pw - 160) / cols;
    const startY = y0 + rowH / 2;

    names.forEach((name, i) => {
      const col = cols === 1 ? 0 : Math.floor(i / rows);
      const row = cols === 1 ? i : i % rows;
      const x = cx - (cols - 1) * colW / 2 + col * colW;
      Fonts.draw('big', name, x, startY + row * rowH, { scale: s, maxWidth: colW - 30 });
    });
  }
}
