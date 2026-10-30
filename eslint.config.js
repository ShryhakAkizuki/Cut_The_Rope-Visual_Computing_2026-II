import globals from 'globals';

export default [
  { ignores: ['src/libraries/**'] },
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        ...globals.browser,

        // p5.js (modo global)
        p5: 'readonly',
        createCanvas: 'readonly', resizeCanvas: 'readonly',
        windowWidth: 'readonly', windowHeight: 'readonly',
        millis: 'readonly', deltaTime: 'readonly',
        mouseX: 'readonly', mouseY: 'readonly',
        pmouseX: 'readonly', pmouseY: 'readonly',
        key: 'readonly',
        push: 'readonly', pop: 'readonly', translate: 'readonly',
        rotate: 'readonly', scale: 'readonly', radians: 'readonly',
        PI: 'readonly',
        fill: 'readonly', noFill: 'readonly', noStroke: 'readonly',
        stroke: 'readonly', strokeWeight: 'readonly',
        rect: 'readonly', text: 'readonly', textSize: 'readonly',
        textAlign: 'readonly', image: 'readonly',
        tint: 'readonly', noTint: 'readonly',
        background: 'readonly', textFont: 'readonly', loadFont: 'readonly',
        CENTER: 'readonly', LEFT: 'readonly', RIGHT: 'readonly',
        BASELINE: 'readonly',

        // p5.js
        drawingContext: 'readonly',
        line: 'readonly',
        beginShape: 'readonly', endShape: 'readonly', vertex: 'readonly',
        constrain: 'readonly',
        loadImage: 'readonly', loadJSON: 'readonly',
        textWidth: 'readonly', textAscent: 'readonly', textDescent: 'readonly',

        // Matter.js
        Matter: 'readonly',

        // data/config.js
        VIEW: 'readonly', STATE: 'readonly', TUNING: 'readonly',
        ROPE_T: 'readonly', CAMERA_T: 'readonly', AUTO_ROPE_T: 'readonly',
        SPIKES_T: 'readonly', AUDIO_T: 'readonly', SOUND_BUTTON_T: 'readonly',
        TUTORIAL_T: 'readonly', UI_T: 'readonly', MENU_T: 'readonly',
        OMNOM_T: 'readonly', GFX_T: 'readonly',
        CANDY_RADIUS: 'readonly', OMNOM_RADIUS: 'readonly', STAR_RADIUS: 'readonly',
        BUBBLE_RADIUS: 'readonly', ANCHOR_RADIUS: 'readonly',
        CANDY_STAR_BOX: 'readonly', STAR_BOX: 'readonly', PROGRESS_KEY: 'readonly',

        // data/
        LEVELS: 'readonly', TEXTS: 'readonly', CREDITS: 'readonly',
        OMNOM_ANIMATION: 'readonly',

        // core/
        VerletPoint: 'readonly', calculateScore: 'readonly',
        Sound: 'readonly', ProgressStore: 'readonly',
        Camera: 'readonly', Level: 'readonly', Game: 'readonly',
        dispatchClick: 'readonly', dispatchKey: 'readonly',

        // entities/
        Candy: 'readonly', OmNom: 'readonly', Anchor: 'readonly',
        Rope: 'readonly', AutoAnchor: 'readonly', Star: 'readonly',
        Bubble: 'readonly', Spikes: 'readonly', Mover: 'readonly',
        createMover: 'readonly',

        // ui/
        Sprites: 'readonly', Fonts: 'readonly', Animation: 'readonly',
        LoadingScreen: 'readonly', Button: 'readonly', SpriteButton: 'readonly',
        TitleScreen: 'readonly', CreditsScreen: 'readonly',
        LevelMenu: 'readonly', Hud: 'readonly', SoundToggle: 'readonly',
        PauseMenu: 'readonly', WinPanel: 'readonly', Banner: 'readonly',
        Tutorial: 'readonly',
        pointInRect: 'readonly', drawBoxCover: 'readonly', drawVeil: 'readonly',
        drawMenuBackdrop: 'readonly', drawScreenFade: 'readonly',
        createBackButton: 'readonly',
      },
    },
    rules: {
      'no-undef': 'error',
      'no-unused-vars': 'warn',
      'no-var': 'error',
    },
  },
];
