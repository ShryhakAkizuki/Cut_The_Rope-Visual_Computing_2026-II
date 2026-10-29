class Level {

  constructor (data) {
    this.data = data;
    this.map = data.map;
    this.anchors = [];
    this.ropes = [];
    this.autoAnchors = [];
    this.stars = [];
    this.bubbles = [];
    this.spikes = [];
    this.tutorials = [];
    this.candy = null;
    this.omnom = null;
    this.background = LEVEL_BACKGROUNDS[data.background] || null;
  }

  build (game) {
    const d = this.data;

    this.candy = new Candy(d.candy.x, d.candy.y, CANDY_RADIUS);
    this.candy.createBody();

    this.omnom = new OmNom(d.omnom.x, d.omnom.y, OMNOM_RADIUS);
    this.omnom.createBody();

    for (const a of d.anchors) {
      const anchor = new Anchor(a.x, a.y);
      anchor.createBody();

      const rope = new Rope(anchor, this.candy, a.length);
      rope.create(game);

      this.anchors.push(anchor);
      this.ropes.push(rope);
    }

    for (const a of d.autoAnchors || []) {
      const autoAnchor = new AutoAnchor(a.x, a.y, a.radius, a.length, a.chain);
      autoAnchor.createBody();
      this.autoAnchors.push(autoAnchor);
    }

    for (const s of d.stars || []) {
      const star = new Star(s.x, s.y, s.path, s.moveSpeed);
      star.createBody();
      this.stars.push(star);
    }

    for (const b of d.bubbles || []) {
      const bubble = new Bubble(b.x, b.y);
      bubble.createBody();
      this.bubbles.push(bubble);
    }

    for (const s of d.spikes || []) {
      const spikes = new Spikes(s.x, s.y, s.size, s.angle, s.path, s.moveSpeed);
      spikes.createBody();
      this.spikes.push(spikes);
    }

    for (const t of d.tutorials || []) {
      this.tutorials.push(new Tutorial(t, game));
    }

    Matter.Composite.add(game.world, [
      this.candy.body,
      this.omnom.body,
      ...this.anchors.map((a) => a.body),
      ...this.autoAnchors.map((a) => a.body),
      ...this.stars.map((s) => s.body),
      ...this.bubbles.map((b) => b.body),
      ...this.spikes.map((s) => s.body),
    ].filter(Boolean));
  }

  clear (game) {
    Matter.Composite.clear(game.world, false, true);
    this.anchors = [];
    this.ropes = [];
    this.autoAnchors = [];
    this.stars = [];
    this.bubbles = [];
    this.spikes = [];
    this.tutorials = [];
    this.candy = null;
    this.omnom = null;
  }

  // Rectángulo del mapa en VIEW: centrado en horizontal (offsetX = (VIEW.w − map.w) / 2), desde y = 0.
  bounds () {
    return { x: (VIEW.w - this.map.w) / 2, y: 0, w: this.map.w, h: this.map.h };
  }

  // Orden de GameScene.Draw de DX: fondo, Om Nom, tutoriales, burbujas, púas, ganchos, cuerdas,
  // estrellas y dulce (con la burbuja que lo lleva encima).
  draw () {
    this.drawBackground();
    if (this.omnom) this.omnom.draw();
    for (const t of this.tutorials) t.draw();
    for (const b of this.bubbles) b.draw();
    for (const s of this.spikes) s.draw();
    for (const a of this.autoAnchors) a.draw();
    for (const a of this.anchors) a.draw();
    for (const r of this.ropes) r.draw();
    for (const s of this.stars) s.draw();
    if (this.candy) this.candy.draw();
    for (const b of this.bubbles) b.drawOnCandy();
  }

  // Fondo de la caja como GameScene.Draw de DX: bgr_01_p1 centrado en VIEW (cubre también las
  // franjas laterales de los mapas de 320) y repetido hacia abajo en los mapas altos (nivel 15);
  // bgr_01_p2 tapa cada costura entre dos copias (BackgroundTiling.GetP2Count / ResolveP2Y).
  drawBackground () {
    const h = Sprites.size('bgr_01_p1').h;
    const rows = Math.max(1, Math.ceil(this.map.h / h - 0.001));
    for (let i = 0; i < rows; i++) Sprites.draw('bgr_01_p1', 0, VIEW.w / 2, i * h, { ay: 0 });
    for (let i = 0; i < rows - 1; i++) Sprites.draw('bgr_01_p2', 0, VIEW.w / 2, GFX_T.bgP2Y + i * h, { ay: 0 });
  }
}
