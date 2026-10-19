let game = null;

function setup () {
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
