
const VIEW = { w: 390, h: 844 };

const COLORS = {
  star:  [255, 220, 60],
  rope:  [220, 220, 220],
  candy: [255, 120, 120],
};

const STATE = {
  MENU:    'MENU',
  PLAYING: 'PLAYING',
  PAUSED:  'PAUSED',
  WIN:     'WIN',
  LOSE:    'LOSE',
};

const TUNING = {
  starPoints:        1000,
  timeBonusPerSecond: 100,
  defaultLevelTime:   30,
  bubbleLift:         1.5,
  bubbleFrictionAir:  0.05,
  candyFrictionAir:   0.01,
  maxFrameDeltaMs:    100,
  // Distancia (centro a centro) para abrir/cerrar la boca según el dulce.
  // El segundo valor es mayor para evitar parpadeos (histéresis).
  mouthOpenRadius:    130,
  mouthCloseRadius:   165,
  // Distancia al centro de OmNom para considerar que el dulce ya entró en la boca.
  eatRadius:          24,
  // Espera antes de mostrar el panel de victoria para apreciar la animación de comer.
  winRevealDelay:     1600,
};

const ROPE_T = {
  pieceLifetime:  3000,
  pieceFadeStart: 2000,
  eatenFadeDuration: 600,
  tautEpsilon:    0.5,
  curveSegments:  16,
};

const BUBBLE_RADIUS = 30;

const PROGRESS_KEY = 'ctr_progress_v1';
