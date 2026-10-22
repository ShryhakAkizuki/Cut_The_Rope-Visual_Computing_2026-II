// Pista F: elementos de tutorial (texto, signos, dedo animado y fades), uno por nodo de `tutorials` en LEVELS.
// Comportamiento de GameMain/Tutorials/ de DX: cada elemento espera su disparador (TutorialTrigger),
// y al dispararse reproduce una línea de tiempo (TutorialPromptLoader.BuildEnvelope) con la opacidad
// (fadeIn → duration → fadeOut) y, si tiene `path`, el recorrido del dedo (TutorialMotion), repetida
// `repeat` veces. Los tiempos van en segundos, como en el XML.
class Tutorial {

  // Fuente del texto: la TTF de SmallFont (gooddog_new-webfont.ttf), que es con la que DX dibuja los
  // tutoriales (SkiaFont, no la hoja bitmap small_font). Fonts.preload() la carga en preload();
  // si falló (sin `font` de opentype) se usa la fuente por defecto de p5.
  static get font () {
    return Fonts.ttf && Fonts.ttf.font ? Fonts.ttf : null;
  }

  constructor (data, game) {
    this.data = data;
    this.game = game;
    this.isText = data.type === 'text';

    const T = TUTORIAL_T;
    this.fadeIn = data.fadeIn ?? T.fadeIn;
    this.hold = data.duration ?? (this.isText ? T.textDuration : T.signDuration);
    this.fadeOut = data.fadeOut ?? T.fadeOut;
    this.holdsForever = this.hold === T.forever;
    this.repeat = data.repeat ?? 1;
    this.loops = this.repeat === T.forever;
    this.passTime = this.holdsForever ? Infinity : this.fadeIn + this.hold + this.fadeOut;
    this.motion = data.path ? this.buildMotion(data) : null;

    // 'armed' espera el disparador, 'playing' reproduce la línea de tiempo y 'done' ya terminó.
    // Sin `showOn` (o con 'start') arranca al empezar el nivel, como el evento Start de DX.
    this.trigger = data.showOn || 'start';
    this.state = this.trigger === 'start' ? 'playing' : 'armed';
    this.time = 0;

    this.lines = null;   // líneas del texto ya ajustadas a `width`; se calculan en el primer draw
  }

  // Tramos del recorrido (TutorialMotion.Parse): `path` son offsets [dx, dy, …] respecto a (x, y), sin escalar,
  // y `moveSpeed` está en px/s de VIEW. Cada tramo dura su distancia / moveSpeed; `ease` es una lista
  // por tramo o un solo valor para todos ('none', 'in', 'out').
  buildMotion (data) {
    const speed = data.moveSpeed ?? TUTORIAL_T.moveSpeed;
    const eases = Array.isArray(data.ease) ? data.ease : String(data.ease ?? 'none').split(',');
    const legs = [];
    let px = 0;
    let py = 0;
    for (let i = 0; i + 1 < data.path.length; i += 2) {
      const dx = data.path[i];
      const dy = data.path[i + 1];
      legs.push({
        x0: px, y0: py, x1: dx, y1: dy,
        time: Math.hypot(dx - px, dy - py) / speed,
        ease: (eases.length === 1 ? eases[0] : eases[legs.length]) || 'none',
      });
      px = dx;
      py = dy;
    }
    return { delay: data.moveDelay ?? 0, legs };
  }

  update (dt) {
    if (this.state === 'armed' && this.isTriggered()) this.state = 'playing';
    if (this.state !== 'playing') return;

    this.time += dt / 1000;
    if (this.loops) {
      if (this.time >= this.passTime) this.time %= this.passTime;
    } else if (this.time >= this.passTime * this.repeat) {
      this.state = 'done';
    }
  }

  // Disparadores de la Caja 1: solo 'bubbled' (nivel 5): el dulce está dentro de una burbuja y
  // su centro dentro de `inArea` (rectángulo semiabierto, como TutorialArea.Contains).
  isTriggered () {
    const game = this.game;
    if (this.trigger !== 'bubbled' || !game.candy || !game.candyBubble()) return false;
    const a = this.data.inArea;
    if (!a) return true;
    const p = game.candy.body.position;
    return p.x >= a.x && p.x < a.x + a.w && p.y >= a.y && p.y < a.y + a.h;
  }

  // Opacidad de 0 a 1 en el instante `t` de la pasada: sube en fadeIn, se mantiene `hold` y baja en fadeOut.
  alphaAt (t) {
    if (t < this.fadeIn) return this.fadeIn > 0 ? t / this.fadeIn : 1;
    if (this.holdsForever) return 1;
    t -= this.fadeIn;
    if (t < this.hold) return 1;
    t -= this.hold;
    return this.fadeOut > 0 ? Math.max(0, 1 - t / this.fadeOut) : 0;
  }

  // Desplazamiento del dedo en el instante `t` de la pasada: quieto durante moveDelay, recorre los tramos
  // y se queda en el último punto el resto de la pasada. 'in' arranca desde parado (t²) y 'out' frena (1 − (1 − t)²),
  // como FRAME_TRANSITION_EASE_IN/EASE_OUT de Track.cs.
  offsetAt (t) {
    if (!this.motion) return { x: 0, y: 0 };
    t -= this.motion.delay;
    if (t <= 0) return { x: 0, y: 0 };
    for (const leg of this.motion.legs) {
      if (t < leg.time) {
        let k = t / leg.time;
        if (leg.ease === 'in') k = k * k;
        else if (leg.ease === 'out') k = 1 - (1 - k) * (1 - k);
        return { x: leg.x0 + (leg.x1 - leg.x0) * k, y: leg.y0 + (leg.y1 - leg.y0) * k };
      }
      t -= leg.time;
    }
    const last = this.motion.legs[this.motion.legs.length - 1];
    return last ? { x: last.x1, y: last.y1 } : { x: 0, y: 0 };
  }

  // Se oculta al ganar o perder; en pausa queda congelado porque update() no corre.
  isVisible () {
    const s = this.game.state;
    return this.state === 'playing' && s !== STATE.WIN && s !== STATE.LOSE;
  }

  draw () {
    if (!this.isVisible()) return;
    const t = this.loops ? this.time : this.time % this.passTime;
    const alpha = this.alphaAt(t);
    if (alpha <= 0) return;
    const off = this.offsetAt(t);

    push();
    drawingContext.globalAlpha = alpha;
    if (this.isText) this.drawText(this.data.x + off.x, this.data.y + off.y);
    else this.drawSign(this.data.x + off.x, this.data.y + off.y);
    pop();
  }

  // Signo `tutorialNN` = cuadro NN − 1 de la hoja tutorial_signs, centrado en (x, y) sobre su recorte:
  // en DX TutorialSign usa SetDrawQuad sin restaurar la transparencia recortada, así que se ignoran
  // el desplazamiento y el tamaño original del atlas (todos los cuadros traen el lienzo de 998×1058).
  drawSign (x, y) {
    const sheet = Sprites.sheets[TUTORIAL_T.signSheet];
    const f = sheet && sheet.img ? sheet.frames[this.data.sign - 1] : null;
    if (!f) return;
    translate(x, y);
    rotate(radians(this.data.angle || 0));
    image(sheet.img, -f.w / 2, -f.h / 2, f.w, f.h, f.x, f.y, f.w, f.h);
  }

  // Texto de TEXTS[clave] (si falta, la clave tal cual) con (x, y) en la esquina superior izquierda de una caja
  // de ancho `width` y cada línea centrada en ella (Text con alineación HCENTER y ancla TOP|LEFT en DX).
  // Como SkiaTextRenderer.Draw: la primera línea empieza TopSpacing más abajo, la línea base está a la
  // altura del ascendente y cada línea baja (int)(alto de fuente + LineSpacing) = 77.
  drawText (x, y) {
    const T = TUTORIAL_T;
    if (Tutorial.font) textFont(Tutorial.font);
    if (!this.lines) this.layoutText();

    textSize(this.fontSize);
    textAlign(LEFT, BASELINE);
    noStroke();
    fill(T.textColor);

    const lineHeight = Math.floor(T.fontHeight + T.lineSpacing);
    const angle = this.data.angle || 0;
    if (angle) {
      // Gira sobre el centro de la caja (BaseElement: width/2, height/2), con el alto de
      // Text.SetStringandWidth: (alto de fuente + LineSpacing) × líneas − LineSpacing + TopSpacing.
      const h = (T.fontHeight + T.lineSpacing) * this.lines.length - T.lineSpacing + T.topSpacing;
      translate(x + this.boxWidth / 2, y + h / 2);
      rotate(radians(angle));
      translate(-(x + this.boxWidth / 2), -(y + h / 2));
    }

    const baseline = y + T.topSpacing + textAscent();
    this.lines.forEach((line, i) => {
      text(line.str, x + (this.boxWidth - line.w) / 2, baseline + i * lineHeight);
    });
  }

  // Tamaño de letra con el que ascendente + descendente mide TUTORIAL_T.fontHeight (como SkiaFont en DX)
  // y ajuste de línea de Text.FormatText: se parte por espacios y una palabra pasa a la línea siguiente
  // si con ella (y su espacio) la línea supera `width`; una palabra más larga que la caja se queda sola
  // en su línea. Los anchos son la suma de los avances de cada letra (FontGeneric.StringWidth); GoodDog
  // no trae tabla de kerning, así que coinciden con textWidth(). Sin `width` la caja mide lo que la
  // línea más larga (SetString con ancho −1).
  layoutText () {
    textSize(100);
    this.fontSize = TUTORIAL_T.fontHeight * 100 / (textAscent() + textDescent());
    textSize(this.fontSize);

    const key = this.data.text;
    const str = TEXTS[key] !== undefined ? TEXTS[key] : String(key);
    const width = this.data.width || Infinity;
    const lines = [];
    for (const paragraph of str.split('\n')) {
      let line = '';
      for (const word of paragraph.split(' ')) {
        const next = line ? `${line} ${word}` : word;
        if (line && textWidth(next) > width) {
          lines.push(line);
          line = word;
        } else {
          line = next;
        }
      }
      lines.push(line);
    }
    this.lines = lines.map(s => ({ str: s, w: textWidth(s) }));
    this.boxWidth = this.data.width || Math.max(...this.lines.map(l => l.w));
  }
}
