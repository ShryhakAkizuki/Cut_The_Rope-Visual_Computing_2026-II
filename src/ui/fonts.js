// Fuentes del DX. En DX los textos se generan con GoodDog (gooddog_new-webfont.ttf) y tres
// configuraciones (Resources.GetConfiguration); aquí se usan las mismas como hojas bitmap:
// - big:     BigFont, blanca con borde y sombra (títulos, botones, números del menú de niveles)
// - small:   SmallFont, negra (rótulos de resultados, etiqueta del nivel en la pausa, tutoriales)
// - numbers: FontNumbersBig, negra (puntaje de la pantalla de resultados)
// Cada cuadro del atlas trae su `char`; el espacio no viene en la hoja y usa `space`.
const BITMAP_FONTS = {
  big:     { sheet: 'big_font',         space: 30, spacing: -6 },
  small:   { sheet: 'small_font',       space: 20, spacing: -1 },
  numbers: { sheet: 'font_numbers_big', space: 30, spacing: 2 },
};

// TTF para lo que se dibuja antes de que lleguen las hojas (pantalla de carga).
const TTF_FONT_PATH = 'assets/fonts/gooddog_new-webfont.ttf';

const Fonts = {
  maps: {},
  ttf: null,
  missing: new Set(),

  // Llamar desde preload(): la TTF pesa poco y la pantalla de carga la necesita ya.
  preload () {
    // p5 1.5 llama al callback de éxito si no es `undefined`, así que no se pasa null.
    this.ttf = loadFont(TTF_FONT_PATH, () => {}, () => console.error(`Fonts: no se pudo cargar ${TTF_FONT_PATH}`));
  },

  glyphs (font) {
    if (this.maps[font]) return this.maps[font];
    const spec = BITMAP_FONTS[font];
    const map = new Map();
    for (const f of Sprites.sheets[spec.sheet].frames) {
      if (f.char !== undefined) map.set(f.char, f);
    }
    this.maps[font] = map;
    return map;
  },

  glyph (font, ch) {
    const g = this.glyphs(font).get(ch);
    if (!g && ch !== ' ' && !this.missing.has(font + ch)) {
      this.missing.add(font + ch);
      console.warn(`Fonts: "${ch}" no está en ${BITMAP_FONTS[font].sheet}`);
    }
    return g;
  },

  // Alto de la celda de los glifos (156 en las tres hojas).
  lineHeight (font, scale = 1) {
    const first = Sprites.sheets[BITMAP_FONTS[font].sheet].frames[0];
    return first.sh * scale;
  },

  width (font, str, scale = 1) {
    const spec = BITMAP_FONTS[font];
    const chars = Array.from(String(str));
    let w = 0;
    chars.forEach((ch, i) => {
      const g = this.glyph(font, ch);
      w += g ? g.sw : spec.space;
      if (i < chars.length - 1) w += spec.spacing;   // como GetCharOffset: no después del último
    });
    return w * scale;
  },

  // Dibuja una línea con (x, y) en el centro vertical de la celda. Opciones:
  // align 'left' | 'center' | 'right'; scale; maxWidth (reduce la escala para que quepa).
  draw (font, str, x, y, opts = {}) {
    const spec = BITMAP_FONTS[font];
    const sheet = Sprites.sheets[spec.sheet];
    const align = opts.align || 'center';
    let scale = opts.scale || 1;
    if (opts.maxWidth) {
      const natural = this.width(font, str, scale);
      if (natural > opts.maxWidth) scale *= opts.maxWidth / natural;
    }
    const total = this.width(font, str, scale);
    let cx = align === 'left' ? x : align === 'right' ? x - total : x - total / 2;
    const top = y - this.lineHeight(font, scale) / 2;

    for (const ch of Array.from(String(str))) {
      const g = this.glyph(font, ch);
      if (g) {
        image(sheet.img, cx + g.ox * scale, top + g.oy * scale, g.w * scale, g.h * scale, g.x, g.y, g.w, g.h);
        cx += (g.sw + spec.spacing) * scale;
      } else {
        cx += (spec.space + spec.spacing) * scale;
      }
    }
    return total;
  },
};
