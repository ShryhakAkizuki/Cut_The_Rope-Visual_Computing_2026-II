import globals from 'globals';

export default [
  { ignores: ['src/libraries/**'] },
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
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

      },
    },
    rules: {
      'no-undef': 'error',
      'no-unused-vars': 'warn',
      'no-var': 'error',
    },
  },
];
