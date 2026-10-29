let game = null;
let loading = null;
let viewScale = 1;

// preload() no dibuja nada: aquí solo se trae lo que necesita la pantalla de carga.
function preload () {
    Sprites.preloadBoot();
    Fonts.preload();
}

function setup () {
    createCanvas(VIEW.w, VIEW.h);
    fitCanvas();

    // El resto de hojas llega en segundo plano; draw() muestra la carga y crea el juego al final.
    // Mientras tanto `game` es un sustituto que ignora la entrada.
    Sprites.loadAll();
    loading = new LoadingScreen();
    game = { onCutAttempt () {}, onInput () {}, onKeyDown () {}, autoPause () {}, autoResume () {} };

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
    if (loading) {
        loading.update(Sprites.progress);
        scale(viewScale);
        loading.draw();
        if (loading.done && Sprites.ready) {
            loading = null;
            game = new Game(LEVELS);
            game.showTitle();
        }
        return;
    }

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
