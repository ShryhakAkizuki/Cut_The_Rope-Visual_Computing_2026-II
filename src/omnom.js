class OmNom {

    constructor (x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.body = null;
    }

    createBody () {
        this.body = Matter.Bodies.circle(this.x, this.y, this.radius, {
            label: 'omnom',
            isStatic: true,
            isSensor: true
        });
    }

    draw () {
        noFill();
        stroke(255, 200, 80);
        strokeWeight(4);
        circle(this.x, this.y, this.radius * 2);
    }
}
