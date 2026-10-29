class SpriteAnimator {

    constructor (definition, fallbackSize) {
        this.definition = definition;
        this.fallbackSize = fallbackSize;
        this.images = {};
        this.animationName = definition.defaultAnimation;
        this.animationIndex = 0;
        this.animationTime = 0;
        this.sequence = null;

        for (const [name, atlas] of Object.entries(definition.atlases)) {
            this.images[name] = loadImage(atlas.path);
        }
    }

    setAnimation (name, preserveSequence = false) {
        if (!this.definition.animations[name]) return;
        this.animationName = name;
        this.animationIndex = 0;
        this.animationTime = 0;
        if (!preserveSequence) this.sequence = null;
    }

    playSequence (names) {
        const sequence = names.slice();
        this.setAnimation(sequence.shift());
        this.sequence = sequence;
    }

    update (dt) {
        const animation = this.definition.animations[this.animationName];
        if (!animation || animation.frames.length < 2) return;

        this.animationTime += dt;
        while (this.animationTime >= animation.frameDuration) {
            this.animationTime -= animation.frameDuration;
            this.animationIndex += 1;

            if (this.animationIndex < animation.frames.length) continue;
            if (animation.loop) {
                this.animationIndex = 0;
                continue;
            }
            if (this.sequence && this.sequence.length > 0) {
                this.setAnimation(this.sequence.shift(), true);
            } else {
                this.animationIndex = animation.frames.length - 1;
            }
            break;
        }
    }

    draw (x, y) {
        const animation = this.definition.animations[this.animationName];
        const atlas = this.definition.atlases[animation.atlas];
        const imageSource = this.images[animation.atlas];
        if (!imageSource || !imageSource.width || !imageSource.height) {
            this.drawFallback(x, y);
            return;
        }

        const frameId = animation.frames[this.animationIndex];
        const frame = atlas.frames[frameId];
        if (!frame) {
            this.drawFallback(x, y);
            return;
        }

        const scale = this.fallbackSize / atlas.referenceWidth;
        const drawWidth = frame.w * scale;
        const drawHeight = frame.h * scale;
        // pivotX/pivotY son coordenadas locales del recorte que se colocan
        // sobre la posición de la entidad. Si no existen, se usa su centro.
        const pivotX = frame.pivotX ?? frame.w / 2;
        const pivotY = frame.pivotY ?? frame.h / 2;
        const drawX = Math.round(x - pivotX * scale);
        const drawY = Math.round(y - pivotY * scale);

        imageMode(CORNER);
        image(
            imageSource,
            drawX,
            drawY,
            drawWidth,
            drawHeight,
            frame.x,
            frame.y,
            frame.w,
            frame.h
        );
    }

    drawFallback (x, y) {
        noFill();
        stroke(255, 200, 80);
        strokeWeight(4);
        circle(x, y, this.fallbackSize);
    }
}
