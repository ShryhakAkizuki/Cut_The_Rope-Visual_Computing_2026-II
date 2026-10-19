class Bubble {

    constructor (x, y) {
        this.x = x;
        this.y = y;
        this.radius = BUBBLE_RADIUS;
        this.body = null;
        this.candy = null;
        this.popped = false;
    }

    createBody () {
        this.body = Matter.Bodies.circle(this.x, this.y, this.radius, {
            label: 'bubble',
            isStatic: true,
            isSensor: true
        });
    }

    get captured () {
        return this.candy !== null && !this.popped;
    }

    capture (candy) {
        this.candy = candy;
    }

    pop () {
        this.popped = true;
    }

    center () {
        return this.captured ? this.candy.body.position : { x: this.x, y: this.y };
    }

    contains (px, py) {
        if (!this.captured) return false;
        const c = this.center();
        return Math.hypot(px - c.x, py - c.y) <= this.radius;
    }

    draw () {
        if (this.popped) return;
        const c = this.center();
        stroke(150, 200, 255, 180);
        strokeWeight(2);
        fill(80, 160, 255, 90);
        circle(c.x, c.y, this.radius * 2);
    }
}
