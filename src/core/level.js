class Level {

  constructor (data) {
    this.data = data;
    this.map = data.map;
    this.anchors = [];
    this.ropes = [];
    this.stars = [];
    this.bubbles = [];
    this.candy = null;
    this.omnom = null;
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

  // Rectángulo del mapa en VIEW: centrado en horizontal (offsetX = (VIEW.w − map.w) / 2), desde y = 0.
  bounds () {
    return { x: (VIEW.w - this.map.w) / 2, y: 0, w: this.map.w, h: this.map.h };
  }

  draw () {
    const b = this.bounds();
    noStroke();
    fill(COLORS.map);
    rect(b.x, b.y, b.w, b.h);

    for (const a of this.anchors) a.draw();
    for (const r of this.ropes) r.draw();
    for (const s of this.stars) s.draw();
    if (this.omnom) this.omnom.draw();
    if (this.candy) this.candy.draw();
    for (const b of this.bubbles) b.draw();
  }
}
