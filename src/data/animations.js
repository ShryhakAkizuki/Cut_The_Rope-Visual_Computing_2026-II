const OMNOM_ANIMATIONS = {
    defaultAnimation: 'idle',
    atlases: {
        estados: { path: 'img/char_estados.png', jsonPath: 'img/char_estados.json' },
        lose: { path: 'img/char_lose.png', jsonPath: 'img/char_lose.json' },
    },
    animations: {
        idle: { atlas: 'estados', frames: { from: 0, to: 18 }, frameDuration: 70, loop: true },
        mouthOpen: { atlas: 'estados', frames: { from: 19, to: 27 }, frameDuration: 70, loop: false },
        mouthClose: { atlas: 'estados', frames: { from: 28, to: 31 }, frameDuration: 70, loop: false },
        chew: { atlas: 'estados', frames: { from: 32, to: 40 }, frameDuration: 70, loop: false },
        blink: { atlas: 'estados', frames: { from: 41, to: 42 }, frameDuration: 70, loop: false },
        idle2: { atlas: 'estados', frames: { from: 43, to: 67 }, frameDuration: 70, loop: true },
        idle3: { atlas: 'estados', frames: { from: 68, to: 81 }, frameDuration: 70, loop: true },
        fail: { atlas: 'lose', frames: { from: 0, to: 12 }, frameDuration: 70, loop: false },
    },
};


function prepareOmNomAnimations (atlasJson) {
    for (const [name, atlas] of Object.entries(OMNOM_ANIMATIONS.atlases)) {
        const data = atlasJson[name];
        // entry.frame puede incluir pivotX/pivotY (los genera tools/sprite_pivots.py).
        atlas.frames = data.frames.map((entry) => entry.frame);
        atlas.referenceWidth = Math.max(...atlas.frames.map((frame) => frame.w));
    }

    for (const animation of Object.values(OMNOM_ANIMATIONS.animations)) {
        const { from, to } = animation.frames;
        animation.frames = [];
        for (let i = from; i <= to; i += 1) animation.frames.push(i);
    }
}
