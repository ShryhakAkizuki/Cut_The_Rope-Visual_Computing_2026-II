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
// Archivos de assets/sounds/ (efectos WAV del DX tal cual; música FLAC del DX pasada a MP3 de 128 kbps).
// Los nombres cortos son los que recibe Sound.play()/Sound.playMusic(); la tabla de eventos está en core/audio.js.
const AUDIO_T = {
  basePath: 'assets/sounds/',
  sfx: {
    cut1:         'rope_bleak_1.wav',
    cut2:         'rope_bleak_2.wav',
    cut3:         'rope_bleak_3.wav',
    cut4:         'rope_bleak_4.wav',
    ropeGet:      'rope_get.wav',
    star1:        'star_1.wav',
    star2:        'star_2.wav',
    star3:        'star_3.wav',
    bubble:       'bubble.wav',
    bubbleBreak:  'bubble_break.wav',
    candyBreak:   'candy_break.wav',
    omnomOpen:    'monster_open.wav',
    omnomClose:   'monster_close.wav',
    omnomChew:    'monster_chewing.wav',
    omnomSad:     'monster_sad.wav',
    omnomGreet:   'monster_greeting.wav',
    omnomExcited: 'monster_excited.wav',
    win:          'win.wav',
    tap:          'tap.wav',
    pauseDown:    'pause_down.wav',
    pauseUp:      'pause_up.wav',
  },
  music: {
    menu: 'menu_music.mp3',
    game: 'game_music.mp3',
  },
  sfxVolume:   1.0,
  musicVolume: 0.7,
  musicFadeMs: 250,           // fundido al parar o cambiar de pista (evita el chasquido)
  storageKey:  'ctr_muted_v1',
};

// [tutoriales] pista F
const TUTORIAL_T = {};

// Radios de colisión en el espacio de VIEW (cajas de GameScene.BoundingBoxes.cs y STAR_RADIUS de DX)
const CANDY_RADIUS  = 54;
const OMNOM_RADIUS  = 54;
const STAR_RADIUS   = 42;
const BUBBLE_RADIUS = 60;
const ANCHOR_RADIUS = 20;

const PROGRESS_KEY = 'ctr_progress_v1';
