let game = null;
const OMNOM_ATLAS_JSON = {};

function preload () {
    for (const [name, atlas] of Object.entries(OMNOM_ANIMATIONS.atlases)) {
        OMNOM_ATLAS_JSON[name] = loadJSON(atlas.jsonPath);
    }
    for (const level of LEVELS) {
        const path = level.background;
        if (path && !LEVEL_BACKGROUNDS[path]) LEVEL_BACKGROUNDS[path] = loadImage(path);
    }
}

function setup () {
    prepareOmNomAnimations(OMNOM_ATLAS_JSON);
    createCanvas(VIEW.w, VIEW.h);
    game = new Game(LEVELS);
    game.setViewport(width, height);
    game.showMenu();

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) game.autoPause();
        else game.autoResume();
    });
}

function draw () {
    game.update(Math.min(deltaTime, TUNING.maxFrameDeltaMs));
    game.draw(mouseX, mouseY);
}

function mouseDragged () {
    game.onCutAttempt({ x: pmouseX, y: pmouseY }, { x: mouseX, y: mouseY });
}

function mousePressed () {
    game.onInput(mouseX, mouseY);
}

function keyPressed () {
    game.onKeyDown(key);
}
