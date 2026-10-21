let game = null;
let viewScale = 1;

function setup () {
    createCanvas(VIEW.w, VIEW.h);
    fitCanvas();
    game = new Game(LEVELS);
    game.showMenu();

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) game.autoPause();
        else game.autoResume();
    });
}

function windowResized () {
    fitCanvas();
}

// El canvas ocupa lo más que quepa de la ventana con la proporción de VIEW;
// el juego siempre recibe y dibuja en coordenadas de VIEW.
function fitCanvas () {
    viewScale = Math.min(windowWidth / VIEW.w, windowHeight / VIEW.h);
    resizeCanvas(Math.floor(VIEW.w * viewScale), Math.floor(VIEW.h * viewScale));
}

function toView (x, y) {
    return { x: x / viewScale, y: y / viewScale };
}

function draw () {
    game.update(Math.min(deltaTime, TUNING.maxFrameDeltaMs));
    scale(viewScale);
    const p = toView(mouseX, mouseY);
    game.draw(p.x, p.y);
}

function mouseDragged () {
    game.onCutAttempt(toView(pmouseX, pmouseY), toView(mouseX, mouseY));
}

function mousePressed () {
    const p = toView(mouseX, mouseY);
    game.onInput(p.x, p.y);
}

function keyPressed () {
    game.onKeyDown(key);
}
