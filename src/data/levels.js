// Imágenes de fondo cargadas en preload(), indexadas por ruta.
const LEVEL_BACKGROUNDS = {};

const LEVELS = [
  {
    name:    'Nivel 1',
    time:    30,
    background: 'img/escenario_1.jpeg',
    candy:   { x: 195, y: 200, radius: 18 },
    anchors: [
      { x: 195, y: 80 },
    ],
    stars:   [
      { x: 195, y: 320 },
      { x: 195, y: 420 },
      { x: 195, y: 520 },
    ],
    omnom:   { x: 195, y: 640, radius: 40 },
  },
  {
    name:    'Nivel 2',
    time:    30,
    background: 'img/escenario_1.jpeg',
    candy:   { x: 90, y: 180, radius: 18 },
    anchors: [
      { x: 77,  y: 80 },
      { x: 184, y: 80, length: 290 },
      { x: 297, y: 80, length: 460 },
    ],
    stars:   [
      { x: 77, y: 357 },
      { x: 290, y: 357 },
      { x: 100, y: 500 },
    ],
    omnom:   { x: 286, y: 640, radius: 40 },
  },
  {
    name:    'Nivel 3',
    background: 'img/escenario_1.jpeg',
    candy:   { x: 195, y: 260, radius: 18 },
    anchors: [
      { x: 70,  y: 120 },
      { x: 195, y: 70  },
      { x: 320, y: 120 },
    ],
    omnom:   { x: 195, y: 680, radius: 40 },
  },
  {
    name:    'Nivel 4',
    time:    30,
    background: 'img/escenario_1.jpeg',
    candy:   { x: 195, y: 460, radius: 18 },
    anchors: [
      { x: 195, y: 380 },
    ],
    bubbles: [
      { x: 195, y: 560 },
    ],
    stars:   [
      { x: 195, y: 300 },
      { x: 195, y: 220 },
      { x: 195, y: 140 },
    ],
    omnom:   { x: 195, y: 740, radius: 40 },
  },
];
