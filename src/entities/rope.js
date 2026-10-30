import { VerletPoint } from '../core/verlet.js';
import { ROPE_T } from '../data/config.js';

export class Rope {

    constructor (anchor, candy, length) {
        this.anchor = anchor;
        this.candy = candy;
        this.requestedLength = length;
        this.head = null;
        this.tail = null;
        this.parts = [];
        this.cut = -1;
        this.cutTime = 0;
        this.forceWhite = false;
        this.relaxed = 0;
    }

    get isCut () {
        return this.cut !== -1;
    }

    create () {
        const REST = ROPE_T.restSegmentLength;
        this.head = new VerletPoint(this.anchor.x, this.anchor.y, ROPE_T.partWeight);
        this.head.pin = { x: this.anchor.x, y: this.anchor.y };
        this.tail = this.candy.point;
        this.parts = [this.head, this.tail];
        this.tail.addConstraint(this.head, REST);

        const len = this.requestedLength ?? Math.max(0, this.distance() - REST);
        const n = Math.trunc(len / REST + 2);
        const off = {
            x: (this.tail.pos.x - this.head.pos.x) / n,
            y: (this.tail.pos.y - this.head.pos.y) / n,
        };
        this.roll(len, off);
    }

    distance () {
        return Math.hypot(this.tail.pos.x - this.anchor.x, this.tail.pos.y - this.anchor.y);
    }

    roll (len, off) {
        const REST = ROPE_T.restSegmentLength;
        let tailRestLength = Math.trunc(this.tail.constraintTo(this.parts[this.parts.length - 2]).restLength);
        while (len > 0) {
            const last = this.parts[this.parts.length - 2];
            if (len >= REST) {
                const part = new VerletPoint(last.pos.x + off.x, last.pos.y + off.y, ROPE_T.partWeight);
                this.parts.splice(this.parts.length - 1, 0, part);
                const c = this.tail.constraintTo(last);
                c.cp = part;
                c.restLength = tailRestLength;
                part.addConstraint(last, REST);
                len -= REST;
            } else {
                const restLength = Math.trunc(len + tailRestLength);
                if (restLength > REST) {
                    len = REST;
                    tailRestLength = restLength - REST;
                } else {
                    this.tail.constraintTo(last).restLength = restLength;
                    len = 0;
                }
            }
        }
    }

    update (delta) {
        if (this.cutTime > 0) {
            this.cutTime = Math.max(0, this.cutTime - delta);
            if (this.cutTime < ROPE_T.cutFadeTime && this.forceWhite) this.removePart(this.cut);
            if (this.cutTime === 0) this.release();
        }
        if (this.parts.length === 0) return;

        for (const p of this.parts) {
            if (p !== this.tail) p.updateRopePart(delta);
        }
        for (let j = 0; j < ROPE_T.relaxationTimes; j++) {
            for (const p of this.parts) p.satisfyConstraints();
        }
    }

    tryCut (p1, p2) {
        if (this.isCut || this.anchor.chain) return false;

        for (let j = 0; j < this.parts.length - 1; j++) {
            if (segmentIntersection(p1, p2, this.parts[j].pos, this.parts[j + 1].pos)) {
                this.setCut(j);
                return true;
            }
        }
        return false;
    }

    setCut (part) {
        this.cut = part;
        this.cutTime = ROPE_T.cutTime;
        this.forceWhite = true;
    }

    removePart (part) {
        this.forceWhite = false;
        const cutPart = this.parts[part];
        const next = this.parts[part + 1];
        if (!next) {
            cutPart.constraints = [];
        } else if (next.constraintTo(cutPart)) {
            next.removeConstraint(cutPart);
            const stub = new VerletPoint(next.pos.x, next.pos.y, ROPE_T.cutPartWeight);
            stub.prevPos = next.prevPos && { x: next.prevPos.x, y: next.prevPos.y };
            this.parts.splice(part + 1, 0, stub);
            stub.addConstraint(cutPart, ROPE_T.restSegmentLength);
        }
        for (const p of this.parts) {
            if (p !== this.tail) p.setWeight(ROPE_T.cutPartWeight);
        }
    }

    release () {
        const own = new Set(this.parts);
        if (this.tail) this.tail.constraints = this.tail.constraints.filter((c) => !own.has(c.cp));
        if (this.cut === -1) this.cut = 0;
        this.cutTime = 0;
        this.forceWhite = false;
        this.parts = [];
    }

    draw () {
        if (this.parts.length > 0) {
            const alpha = this.cut === -1 || this.forceWhite ? 1 : this.cutTime / ROPE_T.cutFadeTime;
            if (this.cut === -1) {
                this.drawPiece(this.parts, alpha);
            } else {
                const head = [];
                const tail = [];
                let inTail = false;
                this.parts.forEach((p, j) => {
                    const connected = j === 0 || p.constraintTo(this.parts[j - 1]) !== null;
                    if (!p.pin && !connected) {
                        inTail = true;
                        head.push(p);
                    }
                    if (!inTail) head.push(p);
                    else tail.push(p);
                });
                this.drawPiece(head, alpha);
                this.drawPiece(tail, alpha);
            }
        }

        if (this.anchor.drawFront) this.anchor.drawFront();
    }

    drawPiece (parts, alpha) {
        if (parts.length < 3) return;
        const segmentLength = Math.hypot(parts[1].pos.x - parts[0].pos.x, parts[1].pos.y - parts[0].pos.y);
        this.relaxed = stretchLevelFor(segmentLength);

        const pts = parts.map((p) => p.pos);
        const n = (pts.length - 1) * ROPE_T.samplesPerSegment;
        const samples = [];
        for (let i = 0; i <= n; i++) samples.push(pathBezier(pts, i / n));
        drawRopeStripes(samples, ropeDrawColors(Math.round(255 * alpha), segmentLength, this.forceWhite));
    }
}

function stretchLevelFor (segmentLength) {
    const rest = ROPE_T.restSegmentLength;
    const level = ROPE_T.relaxThresholds.findIndex((t) => segmentLength <= rest + t);
    return level === -1 ? ROPE_T.relaxThresholds.length : level;
}

function pathBezier (pts, t) {
    let p = pts;
    while (p.length > 1) {
        const q = [];
        for (let i = 0; i < p.length - 1; i++) {
            q.push({ x: p[i].x + (p[i + 1].x - p[i].x) * t, y: p[i].y + (p[i + 1].y - p[i].y) * t });
        }
        p = q;
    }
    return p[0];
}

function ropeDrawColors (alpha, segmentLength, white = false) {
    const t = ROPE_T;
    if (white) {
        const w = [255, 255, 255];
        return { base1: w, base2: w, shade1: w, shade2: w, alpha };
    }
    const isRed = segmentLength > t.restSegmentLength + t.stretchRedThreshold;
    const redScale = isRed ? segmentLength / t.restSegmentLength * 2 : 1;
    const shade = (c, k) => [Math.min(255, c[0] * k * redScale), c[1] * k, c[2] * k];
    return {
        base1: t.color1,
        base2: t.color2,
        shade1: shade(t.color1, t.shadeFactor1),
        shade2: shade(t.color2, t.shadeFactor2),
        alpha,
    };
}

function drawRopeStripes (pts, colors) {
    const n = pts.length - 1;
    const steps = Math.max(1, n - 1);
    const size = ROPE_T.stripeSamples;
    noFill();
    strokeWeight(ROPE_T.lineWidth);
    let alternate = false;
    for (let i = 0; i < n; i += size) {
        const k = Math.min(1, i / steps);
        const base = alternate ? colors.base1 : colors.base2;
        const shade = alternate ? colors.shade1 : colors.shade2;
        stroke(
            shade[0] + (base[0] - shade[0]) * k,
            shade[1] + (base[1] - shade[1]) * k,
            shade[2] + (base[2] - shade[2]) * k,
            colors.alpha
        );
        beginShape();
        for (let j = i; j <= Math.min(n, i + size); j++) vertex(pts[j].x, pts[j].y);
        endShape();
        alternate = !alternate;
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
