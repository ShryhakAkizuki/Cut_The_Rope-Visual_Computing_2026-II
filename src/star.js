class Star {

    constructor (x, y) {
        this.x = x;
        this.y = y;
        this.radius = 20;
        this.body = null;
        this.collected = false;
    }

    createBody () {
        this.body = Matter.Bodies.circle(this.x, this.y, this.radius, {
            label: 'star',
            isStatic: true,
            isSensor: true
        });
    }

    draw () {
        if (this.collected) return;
        const outer = this.radius;
        const inner = outer * 0.45;
        noStroke();
        fill(255, 220, 60);
        beginShape();
        for (let i = 0; i < 10; i++) {
            const r = i % 2 === 0 ? outer : inner;
            const angle = -HALF_PI + i * PI / 5;
            vertex(this.x + r * cos(angle), this.y + r * sin(angle));
        }
        endShape(CLOSE);
    }
}
