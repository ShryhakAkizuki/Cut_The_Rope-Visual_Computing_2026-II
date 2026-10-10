class Anchor {

    constructor (x, y) {
        this.x = x;
        this.y = y;
        this.body = null;
    }

    createBody () {
        this.body = Matter.Bodies.circle(this.x, this.y, 8, {
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
        circle(pos.x, pos.y, 16);
        fill(60);
        circle(pos.x, pos.y, 8);
    }
}
