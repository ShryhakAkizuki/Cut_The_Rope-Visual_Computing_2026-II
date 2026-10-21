class Star {

    constructor (x, y) {
        this.x = x;
        this.y = y;
        this.radius = STAR_RADIUS;
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
        drawStarShape(this.x, this.y, this.radius, true);
    }
}
