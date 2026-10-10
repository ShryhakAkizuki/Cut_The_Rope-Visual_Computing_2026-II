const ROPE_PIECE_LIFETIME = 3000;
const ROPE_PIECE_FADE_START = 2000;

class Rope {

    constructor (anchor, candy) {
        this.anchor = anchor;
        this.candy = candy;
        this.constraint = null;
        this.game = null;
        this.isCut = false;
        this.pieces = [];
    }

    create (game) {
        this.game = game;

        const a = this.anchor.body.position;
        const b = this.candy.body.position;
        const length = Math.hypot(b.x - a.x, b.y - a.y);

        this.constraint = Matter.Constraint.create({
            bodyA: this.anchor.body,
            bodyB: this.candy.body,
            length: length,
            stiffness: 1
        });

        Matter.Composite.add(game.world, [this.constraint]);
    }

    tryCut (p1, p2) {
        if (this.isCut || !this.constraint) return false;

        const a = this.anchor.body.position;
        const b = this.candy.body.position;
        const point = segmentIntersection(p1, p2, a, b);
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
            if (piece.age >= ROPE_PIECE_LIFETIME) {
                Matter.Composite.remove(this.game.world,
                    [piece.upperBody, piece.lowerBody, piece.upper, piece.lower]);
                this.pieces.splice(i, 1);
            }
        }
    }

    pieceAlpha (age) {
        if (age < ROPE_PIECE_FADE_START) return 255;
        const t = (age - ROPE_PIECE_FADE_START) / (ROPE_PIECE_LIFETIME - ROPE_PIECE_FADE_START);
        return Math.max(0, Math.round(255 * (1 - t)));
    }

    draw () {
        if (!this.isCut && this.constraint) {
            const a = this.anchor.body.position;
            const b = this.candy.body.position;
            stroke(220, 220, 220);
            strokeWeight(3);
            line(a.x, a.y, b.x, b.y);
            return;
        }

        for (const piece of this.pieces) {
            const alpha = this.pieceAlpha(piece.age);
            const u = piece.upperBody.position;
            const l = piece.lowerBody.position;
            const c = this.candy.body.position;
            const a = this.anchor.body.position;

            stroke(220, 220, 220, alpha);
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
