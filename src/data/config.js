// Espacio de juego de la versión DX: el mapa ×3, centrado en un VIEW fijo de 4:3.
const VIEW = { w: 1920, h: 1440 };
const MAP_SCALE = 3;

const COLORS = {
  star:  [255, 220, 60],
  rope:  [220, 220, 220],
  candy: [255, 120, 120],
  map:   [28, 22, 16],
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
  gravityY:          784,   // px/s², GravityEarthY de DX (ya en el espacio ×3)
  bubbleLift:         1.5,
  bubbleFrictionAir:  0.05,
  candyFrictionAir:   0.01,
  maxFrameDeltaMs:    100,
  loseMarginTop:     400,   // DX: GameScene.PointOutOfScreen
  loseMarginBottom:  400,
};

const ROPE_T = {
  pieceLifetime:  3000,
  pieceFadeStart: 2000,
  tautEpsilon:    0.5,
  curveSegments:  16,
  lineWidth:      10,     // DX: Bungee.lineWidth
  pieceRadius:    10,
  // Dibujo como Bungee.DrawBungee y RopeColorHelper (piel por defecto, índice 0)
  restSegmentLength:   105,  // BungeeRestLength: largo de reposo de cada tramo
  stretchRedThreshold: 7,    // BungeeStretchRedThreshold: px de más por tramo para ponerse roja
  samplesPerSegment:   4,    // BungeeDrawSamplePoints
  stripeSamples:       3,    // muestras por franja de color
  color1: [121, 78, 47],     // RGBA(0.475, 0.305, 0.185)
  color2: [172, 112, 70],    // RGBA(0.676, 0.44, 0.276)
  shadeFactor1: 0.4,         // extremo oscuro del degradado (lado del ancla)
  shadeFactor2: 0.45,
};

// Cámara vertical para mapas más altos que VIEW (Camera2D y UpdateCameraTracking de DX)
const CAMERA_T = {
  panStartSpeed:       20,
  panAcceleration:     800,
  panDeceleration:     400,
  panMaxSpeed:         1000,
  panMinSpeed:         300,
  hurryFactor:         1.5,
  hurryMaxSpeed:       5500,
  inputEnableDistance: 100,
  followRate:          14,
};

// Constantes de cada pista de la fase 1; cada una solo edita su bloque.
// [autocuerdas] pista B (AutoRadiusSource.cs y Grab.DrawBack de DX)
const AUTO_ROPE_T = {
  grabPadding:       42,               // CandyGrabPadding (modelo de PC): margen del radio y largo extra de la cuerda
  fadeRatePerSecond: 1.5,              // alpha que pierde el círculo por segundo tras unirse
  circleColor:       [51, 128, 230],   // RGBA(0.2, 0.5, 0.9)
  circleLineWidth:   6,                // DrawGrabCircle: semiancho 3
};

// [púas] pista C (incluye el Mover)
const SPIKES_T = {
  quadWidths:     [212, 333, 453, 566], // SpikesQuadWidths: largo de colisión de spike1–spike4
  bandHalfHeight: 5,                    // SpikesCollisionBandHalfHeight
  firstQuad:      8,                    // StaticSpikeFirstQuad: cuadro de obj_spikes para spike1
  moverSpeedScale: 3.3,                 // DesktopMoverSpeedScale: px/s = moveSpeed × 3,3

  // Dulce roto (CandyBreak.cs): 5 trozos, cuadros 3–7 de obj_candy_01_new
  breakPieces:         5,
  breakFirstQuad:      3,
  breakLastQuad:       7,
  breakGravityY:       500,   // CandyBreakGravityY (px/s²)
  breakAngle:          -90,   // grados; hacia arriba
  breakAngleVar:       50,
  breakSpeed:          150,   // px/s
  breakSpeedVar:       70,
  breakRotateSpeedVar: 600,   // grados/s
  breakLife:           3,     // s
  breakLoseDelay:      1.3,   // s hasta el banner: ScheduleGameLost(0,3) + Selector_animateLevelRestart (1)
};

// [sonido] pista D
const AUDIO_T = {};

// [tutoriales] pista F
// Valores por defecto de DX (TutorialPromptLoader.Parse) cuando el nodo no los trae; tiempos en segundos.
// Texto con la configuración de SmallFont (Resources.cs): alto 72, interlineado 5, margen superior 25, negro.
const TUTORIAL_T = {
  fadeIn:       1,
  textDuration: 5,      // `duration` por defecto de tutorialText
  signDuration: 5.2,    // `duration` por defecto de tutorialNN
  fadeOut:      0.5,
  moveSpeed:    100,    // px/s de VIEW, sin escalar (TutorialMotion)
  forever:      -1,     // `duration` o `repeat` = -1: no se desvanece / se repite sin fin
  fontHeight:   72,     // ascendente + descendente en px de VIEW
  lineSpacing:  5,
  topSpacing:   25,
  textColor:    [0, 0, 0],
  signSheet:    'tutorial_signs',
};

// Radios de colisión en el espacio de VIEW (cajas de GameScene.BoundingBoxes.cs y STAR_RADIUS de DX)
const CANDY_RADIUS  = 54;
const OMNOM_RADIUS  = 54;
const STAR_RADIUS   = 42;
const BUBBLE_RADIUS = 60;
const ANCHOR_RADIUS = 20;

const PROGRESS_KEY = 'ctr_progress_v1';
