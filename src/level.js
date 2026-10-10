class Level {

  constructor (data) {
    this.data = data;
    this.anchors = [];
    this.ropes = [];
    this.candy = null;
    this.omnom = null;
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

      const rope = new Rope(anchor, this.candy);
      rope.create(game);

      this.anchors.push(anchor);
      this.ropes.push(rope);
    }

    Matter.Composite.add(game.world, [
      this.candy.body,
      this.omnom.body,
      ...this.anchors.map((a) => a.body),
    ]);
  }

  clear (game) {
    Matter.Composite.clear(game.world, false, true);
    this.anchors = [];
    this.ropes = [];
    this.candy = null;
    this.omnom = null;
  }

  draw () {
    for (const a of this.anchors) a.draw();
    for (const r of this.ropes) r.draw();
    if (this.omnom) this.omnom.draw();
    if (this.candy) this.candy.draw();
  }
}
