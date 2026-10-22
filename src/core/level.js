class Level {

  constructor (data) {
    this.data = data;
    this.anchors = [];
    this.ropes = [];
    this.stars = [];
    this.bubbles = [];
    this.candy = null;
    this.omnom = null;
    this.background = LEVEL_BACKGROUNDS[data.background] || null;
  }

  build (game) {
    const d = this.data;

    this.candy = new Candy(d.candy.x, d.candy.y, d.candy.radius);
    this.candy.createBody();

    this.omnom = new OmNom(d.omnom.x, d.omnom.y, d.omnom.radius);
    this.omnom.createBody();

    for (const a of d.anchors) {
      const anchor = new Anchor(a.x, a.y);
      anchor.createBody();

      const rope = new Rope(anchor, this.candy, a.length);
      rope.create(game);

      this.anchors.push(anchor);
      this.ropes.push(rope);
    }

    for (const s of d.stars || []) {
      const star = new Star(s.x, s.y);
      star.createBody();
      this.stars.push(star);
    }

    for (const b of d.bubbles || []) {
      const bubble = new Bubble(b.x, b.y);
      bubble.createBody();
      this.bubbles.push(bubble);
    }

    Matter.Composite.add(game.world, [
      this.candy.body,
      this.omnom.body,
      ...this.anchors.map((a) => a.body),
      ...this.stars.map((s) => s.body),
      ...this.bubbles.map((b) => b.body),
    ]);
  }

  clear (game) {
    Matter.Composite.clear(game.world, false, true);
    this.anchors = [];
    this.ropes = [];
    this.stars = [];
    this.bubbles = [];
    this.candy = null;
    this.omnom = null;
  }

  drawBackground () {
    const img = this.background;
    if (!img || !img.width || !img.height) return;
    // Cubre todo el canvas sin deformar la imagen (recorta los sobrantes).
    const scale = Math.max(width / img.width, height / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    imageMode(CORNER);
    image(img, (width - w) / 2, (height - h) / 2, w, h);
  }

  draw () {
    this.drawBackground();
    for (const a of this.anchors) a.draw();
    for (const r of this.ropes) r.draw();
    for (const s of this.stars) s.draw();
    if (this.omnom) this.omnom.draw();
    if (this.candy) this.candy.draw();
    for (const b of this.bubbles) b.draw();
  }
}
