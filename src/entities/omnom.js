 class OmNom {

    constructor (x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.body = null;
        this.animation = new SpriteAnimator(OMNOM_ANIMATIONS, radius * 2.5);
    }

    createBody () {
        this.body = Matter.Bodies.circle(this.x, this.y, this.radius, {
            label: 'omnom',
            isStatic: true,
            isSensor: true
        });
    }

    setAnimation (name, preserveSequence = false) {
        this.animation.setAnimation(name, preserveSequence);
    }

    playSequence (names) {
        this.animation.playSequence(names);
    }

    update (dt) {
        this.animation.update(dt);
    }

    draw () {
        if (!this.body) return;
        const position = this.body.position;
        this.animation.draw(position.x, position.y);
    }
}
