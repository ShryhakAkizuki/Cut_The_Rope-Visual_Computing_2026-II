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
// [autocuerdas] pista B
const AUTO_ROPE_T = {};

// [púas] pista C (incluye el Mover)
const SPIKES_T = {};

// [sonido] pista D
const AUDIO_T = {};

// [tutoriales] pista F
const TUTORIAL_T = {};

// [ui] pista E: HUD, menús, resultados y pantalla de carga. Las posiciones de DX están en su
// pantalla de diseño de 2560 de ancho; `designOffsetX` las lleva al VIEW de 1920 (centrado).
const UI_T = {
  designOffsetX:     (VIEW.w - 2560) / 2,
  hudStarSlot:       100,     // GameScene.Init: hudStarSlotWidth (cuadro de 100×100)
  hudStarFrameMs:    50,      // AddAnimationDelayLoopFirstLast(0.05f, …)
  hudMargin:         8,       // GameController.CreateGameView: x = -8, y = 8
  hudGap:            16,
  levelColumns:      5,       // MenuController.CreateLevelSelect con más de 12 niveles
  levelTile:         218,     // cuadro original de menu_level_ui
  levelRowHeight:    203,
  levelGapX:         10,
  levelGapY:         55,
  levelHoverScale:   1.06,
  coverDim:          0.85,    // el menú de niveles oscurece la tapa de la caja a 0.85
  pauseButtonGap:    5,       // VBox del menú de pausa
  pauseDim:          150,     // alfa del velo sobre el nivel en pausa
  resultsFadeMs:     500,     // la caja de resultados aparece en 0,5 s
  buttonTextPadding: 70,
  loaderLerp:        0.15,    // suavizado de la barra por cuadro (LoadingView usa 0.5)
  loaderScale:       2,
};

// Radios de colisión en el espacio de VIEW (cajas de GameScene.BoundingBoxes.cs y STAR_RADIUS de DX)
const CANDY_RADIUS  = 54;
const OMNOM_RADIUS  = 54;
const STAR_RADIUS   = 42;
const BUBBLE_RADIUS = 60;
const ANCHOR_RADIUS = 20;

const PROGRESS_KEY = 'ctr_progress_v1';
