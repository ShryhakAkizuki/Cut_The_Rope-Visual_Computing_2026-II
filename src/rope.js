class Rope {

    constructor (anchor, candy, length) {
        this.anchor = anchor;
        this.candy = candy;
        this.requestedLength = length;
        this.length = 0;
        this.constraint = null;
        this.game = null;
        this.isCut = false;
        this.pieces = [];
    }

    create (game) {
        this.game = game;

        const distance = this.distance();
        this.length = Math.max(distance, this.requestedLength ?? distance);

        this.constraint = Matter.Constraint.create({
            bodyA: this.anchor.body,
            bodyB: this.candy.body,
            length: this.length,
            stiffness: 1
        });

        Matter.Composite.add(game.world, [this.constraint]);
        this.updateTension();
    }

    distance () {
        const a = this.anchor.body.position;
        const b = this.candy.body.position;
        return Math.hypot(b.x - a.x, b.y - a.y);
    }

    isTaut () {
        return this.distance() >= this.length - ROPE_T.tautEpsilon;
    }

    // A Matter constraint also pushes like a rod; with stiffness 0 it applies no force while slack.
    updateTension () {
        if (!this.constraint) return;
        this.constraint.stiffness = this.isTaut() ? 1 : 0;
    }

    points () {
        const a = this.anchor.body.position;
        const b = this.candy.body.position;
        if (this.isTaut()) return [{ x: a.x, y: a.y }, { x: b.x, y: b.y }];

        const d = this.distance();
        const sag = Math.sqrt(3 * d * (this.length - d) / 8);
        const cx = (a.x + b.x) / 2;
        const cy = (a.y + b.y) / 2 + 2 * sag;

        const pts = [];
        for (let i = 0; i <= ROPE_T.curveSegments; i++) {
            const t = i / ROPE_T.curveSegments;
            const u = 1 - t;
            pts.push({
                x: u * u * a.x + 2 * u * t * cx + t * t * b.x,
                y: u * u * a.y + 2 * u * t * cy + t * t * b.y
            });
        }
        return pts;
    }

    tryCut (p1, p2) {
        if (this.isCut || !this.constraint) return false;

        const pts = this.points();
        let point = null;
        for (let i = 0; i < pts.length - 1 && !point; i++) {
            point = segmentIntersection(p1, p2, pts[i], pts[i + 1]);
        }
        if (!point) return false;

        Matter.Composite.remove(this.game.world, this.constraint);
        this.constraint = null;
        this.isCut = true;

        this.pieces.push(this.createPiece(point));

        return true;
    }

    createPiece (point) {
        const world = this.game.world;

        const upperBody = Matter.Bodies.circle(point.x, point.y, 5, {
            label: 'rope-piece',
            isSensor: true,
            frictionAir: 0.02
        });
        const lowerBody = Matter.Bodies.circle(point.x, point.y, 5, {
            label: 'rope-piece',
            isSensor: true,
            frictionAir: 0.02
        });

        const upper = Matter.Constraint.create({
            bodyA: this.anchor.body,
            bodyB: upperBody,
            length: Math.hypot(point.x - this.anchor.body.position.x,
                                point.y - this.anchor.body.position.y),
            stiffness: 1
        });

        const lower = Matter.Constraint.create({
            bodyA: lowerBody,
            bodyB: this.candy.body,
            length: Math.hypot(point.x - this.candy.body.position.x,
                                point.y - this.candy.body.position.y),
            stiffness: 1
        });

        Matter.Composite.add(world, [upperBody, lowerBody, upper, lower]);

        return { upperBody, lowerBody, upper, lower, age: 0 };
    }

    update (delta_Time) {
        for (let i = this.pieces.length - 1; i >= 0; i--) {
            const piece = this.pieces[i];
            piece.age += delta_Time;
            if (piece.age >= ROPE_T.pieceLifetime) {
                Matter.Composite.remove(this.game.world,
                    [piece.upperBody, piece.lowerBody, piece.upper, piece.lower]);
                this.pieces.splice(i, 1);
            }
        }
        this.updateTension();
    }

    pieceAlpha (age) {
        if (age < ROPE_T.pieceFadeStart) return 255;
        const t = (age - ROPE_T.pieceFadeStart) / (ROPE_T.pieceLifetime - ROPE_T.pieceFadeStart);
        return Math.max(0, Math.round(255 * (1 - t)));
    }

    draw () {
        if (!this.isCut && this.constraint) {
            stroke(COLORS.rope);
            strokeWeight(3);
            noFill();
            beginShape();
            for (const p of this.points()) vertex(p.x, p.y);
            endShape();
            return;
        }

        for (const piece of this.pieces) {
            const alpha = this.pieceAlpha(piece.age);
            const u = piece.upperBody.position;
            const l = piece.lowerBody.position;
            const c = this.candy.body.position;
            const a = this.anchor.body.position;

            stroke(COLORS.rope[0], COLORS.rope[1], COLORS.rope[2], alpha);
            strokeWeight(3);
            line(a.x, a.y, u.x, u.y);
            line(l.x, l.y, c.x, c.y);
        }
    }
}

function crossVec (ax, ay, bx, by) {
    return ax * by - ay * bx;
}

function segmentIntersection (a, b, c, d) {
    const r1x = b.x - a.x, r1y = b.y - a.y;
    const r2x = d.x - c.x, r2y = d.y - c.y;
    const denom = crossVec(r1x, r1y, r2x, r2y);

    if (Math.abs(denom) < 1e-9) return null;

    const qx = c.x - a.x, qy = c.y - a.y;
    const t = crossVec(qx, qy, r2x, r2y) / denom;
    const u = crossVec(qx, qy, r1x, r1y) / denom;

    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
        return { x: a.x + t * r1x, y: a.y + t * r1y };
    }
    return null;
}
