// Espacio de juego
export const VIEW = { w: 1920, h: 1440 };

export const STATE = {
  TITLE:   'TITLE',
  CREDITS: 'CREDITS',
  MENU:    'MENU',
  PLAYING: 'PLAYING',
  PAUSED:  'PAUSED',
  WIN:     'WIN',
  LOSE:    'LOSE',
};

export const TUNING = {
  starPoints:        1000,
  timeBonusPerSecond: 100,
  defaultLevelTime:   30,
  gravityY:          784,
  stepSeconds:       1 / 60,
  ropePhysicsSpeed:  1.4,
  bubbleImpulseY:    -40,
  bubbleImpulseDamping: 14,
  maxFrameDeltaMs:    100,
  loseMarginTop:     400,
  loseMarginBottom:  400,
};

export const ROPE_T = {
  restSegmentLength:   105,
  partWeight:          0.02,
  cutPartWeight:       1e-5,
  relaxationTimes:     30,
  qcpTimestep:         0.016,
  cutTime:             2,
  cutFadeTime:         1.95,
  relaxThresholds:     [0.3, 1, 4],
  lineWidth:      10,

  stretchRedThreshold: 7,
  samplesPerSegment:   4,
  stripeSamples:       3,
  color1: [121, 78, 47],
  color2: [172, 112, 70],
  shadeFactor1: 0.4,
  shadeFactor2: 0.45,
};

// Cámara vertical
export const CAMERA_T = {
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

// Constantes de cada pista
export const AUTO_ROPE_T = {
  grabPadding:       42,
  fadeRatePerSecond: 1.5,
  circleColor:       [51, 128, 230],
  circleLineWidth:   6,
};

// Púas
export const SPIKES_T = {
  quadWidths:     [212, 333, 453, 566],
  bandHalfHeight: 5,
  firstQuad:      8,
  moverSpeedScale: 3.3,

  // Dulce roto 
  breakPieces:         5,
  breakFirstQuad:      3,
  breakLastQuad:       7,
  breakGravityY:       500,
  breakAngle:          -90,
  breakAngleVar:       50,
  breakSpeed:          150,
  breakSpeedVar:       70,
  breakRotateSpeedVar: 600,
  breakLife:           3,
  breakLoseDelay:      1.3,
};

// Sonido
export const AUDIO_T = {
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
  musicFadeMs: 250,
  storageKey:  'ctr_muted_v1',

  // Momentos de los sonidos de Om Nom
  mouthOpenDistance: 200,
  mouthCloseDelay:   1,
  greetDelay:        1.3,
  sadDelayAfterBreak: 0.3,
  omnomVoiceChance:  0.5,
};

// Botón de silencio
export const SOUND_BUTTON_T = {
  sheet:      'menu_options_packed',
  upQuad:     0,
  downQuad:   1,
  iconQuad:   2,
  crossQuad:  4,
  iconScale:  0.65,
  pauseGap:   5,
  menuMargin: 30,
};

// Tutoriales
export const TUTORIAL_T = {
  fadeIn:       1,
  textDuration: 5,
  signDuration: 5.2,
  fadeOut:      0.5,
  moveSpeed:    100,
  forever:      -1,
  fontHeight:   72,
  lineSpacing:  5,
  topSpacing:   25,
  textColor:    [0, 0, 0],
  signSheet:    'tutorial_signs',
};

// HUD, menús, resultados y pantalla de carga.
export const UI_T = {
  designOffsetX:     (VIEW.w - 2560) / 2,
  hudStarSlot:       100,
  hudStarFrameMs:    50,
  hudMargin:         8,
  hudGap:            16,
  levelColumns:      5,
  levelTile:         218,
  levelRowHeight:    203,
  levelGapX:         10,
  levelGapY:         55,
  levelHoverScale:   1.06,
  coverDim:          0.85,
  pauseButtonGap:    5,
  pauseDim:          150,
  resultsFadeMs:     500,
  buttonTextPadding: 70,
  loaderLerp:        0.15,
  loaderScale:       2,
};

// Pantalla de título y créditos
export const MENU_T = {
  bgrScale:        1.25,
  shadowScale:     2,
  shadowStartDeg:  45,
  shadowPeriod:    75,
  logoY:           55,
  logoScale:       1.9,
  buttonsBottom:   85,
  buttonGap:       5,
  fadeMs:          300,
  backQuadUp:      0,
  backQuadDown:    1,

  // Créditos
  popupScale:      1.45,
  popupCenterY:    690,
  titleScale:      1.1,
  courseScale:     0.55,
  headingScale:    0.7,
  nameScale:       0.62,
  nameRowMax:      100,
  nameColumnsFrom: 7,
  footerScale:     0.42,
  omnomX:          1640,
  omnomY:          1190,
};

// Animación de Om Nom en los niveles
export const OMNOM_T = {
  sheet:            'char_animations_hd',
  spriteSize:       203,
  spriteOffsetY:    10,
  mouthOffsetY:     40,
  mouthSensorRadius: 1,
  winShowDelay:     1.5,
};

// Sprites estáticos de las entidades
export const GFX_T = {
  bgP2Y:          1120,
  candyScale:     0.71,
  candyQuads:     [0, 1, 2],
  supportQuad:    0,
  starGlowQuad:   0,
  starQuad:       1,
  bubbleQuad:     0,
  bubbleStainFirst: 1,
  bubbleStainLast:  3,
  bubbleOnCandyQuad: 4,
};

// Radios de colisión en el espacio de VIEW
export const CANDY_RADIUS  = 54;
export const OMNOM_RADIUS  = 54;
export const STAR_RADIUS   = 42;
export const BUBBLE_RADIUS = 60;
export const ANCHOR_RADIUS = 20;

// Cajas de recolección de estrellas
export const CANDY_STAR_BOX = { dx: 1.5, dy: 0, hw: 56, hh: 52 };
export const STAR_BOX       = { dx: -7, dy: -6.5, hw: 41, hh: 41 };

export const PROGRESS_KEY = 'ctr_progress_v1';
