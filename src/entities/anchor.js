class Anchor {

    constructor (x, y) {
        this.x = x;
        this.y = y;
        this.body = null;
    }

    createBody () {
        this.body = Matter.Bodies.circle(this.x, this.y, ANCHOR_RADIUS, {
            label: 'anchor',
            isStatic: true,
            isSensor: true
        });
    }

    draw () {
        if (!this.body) return;
        const pos = this.body.position;
        noStroke();
        fill(120);
        circle(pos.x, pos.y, ANCHOR_RADIUS * 2);
        fill(60);
        circle(pos.x, pos.y, ANCHOR_RADIUS);
    }
}
