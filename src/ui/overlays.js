// HUD del nivel como en DX (GameController.CreateGameView y GameScene.Init):
// - arriba a la derecha, el botón MENÚ de hud_ui (abre la pausa) y a su izquierda Reiniciar;
// - arriba a la izquierda, una casilla de 100 px por estrella del nivel; al recoger una estrella
//   su casilla reproduce los cuadros 1 a 11 de hud_ui a 50 ms por cuadro y se queda en el 11.
const HUD_STAR_FIRST = 1;
const HUD_STAR_LAST = 11;
const HUD_PAUSE_FRAME = 18;     // 26_hud_buttons_es ("MENÚ")
const HUD_RESTART_FRAME = 0;

class Hud {

  constructor () {
    this.pauseButton = new SpriteButton('hud_ui', HUD_PAUSE_FRAME, HUD_PAUSE_FRAME, '', { hoverScale: 1.08 });
    this.restartButton = new SpriteButton('hud_ui', HUD_RESTART_FRAME, HUD_RESTART_FRAME, '', { hoverScale: 1.08 });
    const m = UI_T.hudMargin;
    this.pauseButton.x = VIEW.w - m - this.pauseButton.w;
    this.pauseButton.y = m;
    this.restartButton.x = this.pauseButton.x - UI_T.hudGap - this.restartButton.w;
    this.restartButton.y = m;

    this.shownStars = 0;
    this.starStart = [];     // millis() en que empezó la animación de cada casilla
  }

  // Los botones solo responden mientras se juega.
  setInteractive (on) {
    this.pauseButton.enabled = on;
    this.restartButton.enabled = on;
  }

  drawStars (collected, total) {
    // Al reiniciar el nivel el contador vuelve a 0: se reinician las casillas.
    if (collected < this.shownStars) {
      this.shownStars = 0;
      this.starStart = [];
    }
    while (this.shownStars < collected) {
      this.starStart[this.shownStars] = millis();
      this.shownStars += 1;
    }

    const slot = UI_T.hudStarSlot;
    for (let i = 0; i < Math.min(total, 3); i++) {
      let frame = HUD_STAR_FIRST;
      if (i < this.shownStars) {
        const step = Math.floor((millis() - this.starStart[i]) / UI_T.hudStarFrameMs);
        frame = Math.min(HUD_STAR_LAST, HUD_STAR_FIRST + step);
      }
      Sprites.draw('hud_ui', frame, slot * i + slot / 2, slot / 2);
    }
  }

  draw (state, pointer) {
    this.drawStars(state.starsCollected, state.starsTotal);
    this.restartButton.draw(pointer.x, pointer.y);
    this.pauseButton.draw(pointer.x, pointer.y);
  }
}

// Botón de silencio (ToggleButton de sonido de DX): fondo de menu_options_packed con el icono de
// sonido; silenciado, el icono se apaga y lleva la cruz. Solo dibuja: el clic lo atiende Game.
class SoundToggle extends Button {

  constructor () {
    const T = SOUND_BUTTON_T;
    const size = Sprites.quadSize(T.sheet, T.upQuad);
    super(0, 0, size.w, size.h, '');
  }

  draw (mx, my) {
    if (!this.visible) return;
    const T = SOUND_BUTTON_T;
    const hover = this.contains(mx, my);
    const bg = Sprites.quadSize(T.sheet, T.upQuad);
    const k = T.iconScale;
    const icon = Sprites.quadSize(T.sheet, T.iconQuad);
    const iw = icon.w * k;
    const ih = icon.h * k;
    const ix = (bg.w - iw) / 2;
    const iy = (bg.h - ih) / 2;

    push();
    translate(this.x, this.y);
    Sprites.drawQuad(T.sheet, hover ? T.downQuad : T.upQuad, 0, 0);
    if (Sound.muted) tint(128, 128);
    push();
    translate(ix, iy);
    scale(k);
    Sprites.drawQuad(T.sheet, T.iconQuad, 0, 0);
    pop();
    noTint();
    if (Sound.muted) {
      const cross = Sprites.quadSize(T.sheet, T.crossQuad);
      push();
      translate(ix + iw - cross.w * k / 2, iy + ih - cross.h * k);
      scale(k);
      Sprites.drawQuad(T.sheet, T.crossQuad, 0, 0);
      pop();
    }
    pop();
  }
}

// Menú de pausa: la hoja de cartón rasgado (menu_pause) cuelga de arriba con el nombre del
// nivel, y en el centro una columna de botones largos (menu_buttons 0/1 con BigFont), como el
// VBox de GameController: Continuar, Reiniciar, Saltar nivel y Elegir nivel, con la fila de
// audio (aquí solo el botón de silencio) debajo.
class PauseMenu {

  constructor () {
    this.buttons = {
      resume:  new SpriteButton('menu_buttons', 0, 1, 'Continuar'),
      restart: new SpriteButton('menu_buttons', 0, 1, 'Reiniciar'),
      skip:    new SpriteButton('menu_buttons', 0, 1, 'Saltar nivel'),
      menu:    new SpriteButton('menu_buttons', 0, 1, 'Elegir nivel'),
    };
    const list = Object.values(this.buttons);
    const h = list[0].h;
    const total = list.length * h + (list.length - 1) * UI_T.pauseButtonGap;
    let y = (VIEW.h - total) / 2 + h / 2 + 60;
    for (const b of list) {
      b.centerAt(VIEW.w / 2, y);
      y += h + UI_T.pauseButtonGap;
    }

    this.soundToggle = new SoundToggle();
    const last = list[list.length - 1];
    this.soundToggle.centerAt(VIEW.w / 2, last.y + last.h + SOUND_BUTTON_T.pauseGap + this.soundToggle.h / 2);
  }

  draw (state, pointer) {
    drawVeil(UI_T.pauseDim);

    // La hoja se escala para llegar justo a los dos lados (PausePlateScale de DX).
    const plate = Sprites.size('menu_pause', 0);
    const s = VIEW.w / plate.w;
    push();
    scale(s);
    Sprites.draw('menu_pause', 0, 0, 0, { ax: 0, ay: 0 });
    pop();

    const label = state.bestScore > 0
      ? `Nivel ${state.levelNumber}    Mejor puntuación: ${state.bestScore}`
      : `Nivel ${state.levelNumber}`;
    Fonts.draw('small', label, VIEW.w / 2, 80, { scale: 0.9 });

    for (const b of Object.values(this.buttons)) b.draw(pointer.x, pointer.y);
    this.soundToggle.draw(pointer.x, pointer.y);
  }
}

// Pantalla de resultados (BoxOpenClose.InitWithButtonDelegate) sin el conteo animado: se ve
// directamente su estado final. Cada pieza va en el centro de su marcador de menu_results
// (cuadros 0 a 12, en la pantalla de diseño de 2560), sobre la tapa de la caja cerrada.
const RESULTS_STAR_ON = 13;
const RESULTS_STAR_OFF = 14;
const RESULTS_PLATE = 15;
const RESULTS_STAMP_ES = 22;    // menu_result_es: "PUNTUACIÓN MEJORADA"
const RESULTS_CLEARED = ['¡No está mal!', '¡Bien!', '¡Genial!', '¡Excelente!'];   // LEVEL_CLEARED1-4

class WinPanel {

  constructor () {
    this.buttons = {
      replay: new SpriteButton('menu_buttons', 3, 2, 'Repetir'),
      next:   new SpriteButton('menu_buttons', 3, 2, 'Siguiente'),
      menu:   new SpriteButton('menu_buttons', 3, 2, 'Menú'),
    };
    this.place(this.buttons.replay, 11);
    this.place(this.buttons.next, 10);
    this.place(this.buttons.menu, 9);
    this.shownAt = 0;
    this.improved = false;
  }

  // Centro de un marcador de menu_results en VIEW.
  marker (quad) {
    const c = Sprites.quadCenter('menu_results', quad);
    return { x: c.x + UI_T.designOffsetX, y: c.y };
  }

  place (button, quad) {
    const c = this.marker(quad);
    button.centerAt(c.x, c.y);
  }

  // Se llama al ganar; `improved` muestra el sello de puntuación mejorada.
  show (improved) {
    this.shownAt = millis();
    this.improved = improved;
  }

  layout () {}

  draw (state, pointer) {
    const t = Math.min(1, (millis() - this.shownAt) / UI_T.resultsFadeMs);

    push();
    drawingContext.globalAlpha = t;
    drawBoxCover(1);

    for (let i = 0; i < 3; i++) {
      const c = this.marker(i);
      Sprites.drawCentered('menu_results', i < state.starsCollected ? RESULTS_STAR_ON : RESULTS_STAR_OFF, c.x, c.y);
    }

    const pass = this.marker(3);
    Fonts.draw('big', RESULTS_CLEARED[Math.min(3, state.starsCollected)], pass.x, pass.y);

    const plate = this.marker(4);
    Sprites.drawCentered('menu_results', RESULTS_PLATE, plate.x, plate.y);

    const title = this.marker(7);
    Fonts.draw('small', 'Puntuación final', title.x, title.y);
    const score = this.marker(8);
    Fonts.draw('numbers', String(state.score), score.x, score.y);

    for (const b of Object.values(this.buttons)) b.draw(pointer.x, pointer.y);
    pop();
    drawingContext.globalAlpha = 1;

    if (this.improved) this.drawStamp();
  }

  // El sello entra después de la caja: escala de 3 a 1 y aparece en 0,5 s.
  drawStamp () {
    const delay = UI_T.resultsFadeMs;
    const k = constrain((millis() - this.shownAt - delay) / 500, 0, 1);
    if (k <= 0) return;
    const ease = k * k;
    const c = this.marker(12);
    push();
    drawingContext.globalAlpha = ease;
    translate(c.x, c.y);
    scale(3 - 2 * ease);
    Sprites.drawCentered('menu_results', RESULTS_STAMP_ES, 0, 0);
    pop();
    drawingContext.globalAlpha = 1;
  }
}

// Aviso a pantalla completa (derrota).
class Banner {

  static draw (title, subtitle, view) {
    drawVeil(160);
    Fonts.draw('big', title, view.w / 2, view.h / 2 - 60, { scale: 1.2 });
    Fonts.draw('big', subtitle, view.w / 2, view.h / 2 + 80, { scale: 0.5 });
  }
}
