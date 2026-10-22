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
  stepSeconds:       1 / 60, // paso fijo de la simulación por frame
  ropePhysicsSpeed:  1.4,   // ropePhysicsSpeed del mapa (1 en la Caja 1) × RopePhysicsSpeedMultiplier
  bubbleImpulseY:    -40,   // BubbleImpulseY
  bubbleImpulseDamping: 14, // BubbleImpulseDamping
  maxFrameDeltaMs:    100,
  loseMarginTop:     400,   // DX: GameScene.PointOutOfScreen
  loseMarginBottom:  400,
};

const ROPE_T = {
  // Física de Bungee.cs y ConstrainedPoint.cs
  restSegmentLength:   105,  // BungeeRestLength: largo de reposo de cada tramo
  partWeight:          0.02, // peso de los puntos intermedios (el dulce pesa 1)
  cutPartWeight:       1e-5, // peso de los puntos tras el corte (RemovePart)
  relaxationTimes:     30,   // BUNGEE_RELAXION_TIMES
  qcpTimestep:         0.016, // QCP_FIXED_TIMESTEP: los puntos de la cuerda integran con delta × 0,016
  cutTime:             2,    // SetCut: segundos (de simulación) del desvanecimiento
  cutFadeTime:         1.95, // GetCutFadeAlpha: alpha = cutTime / 1,95; antes, un instante en blanco
  relaxThresholds:     [0.3, 1, 4], // BungeeRelaxThresholdSoft/Medium/Hard → Bungee.relaxed 0..3
  lineWidth:      10,     // DX: Bungee.lineWidth
  // Dibujo como Bungee.DrawBungee y RopeColorHelper (piel por defecto, índice 0)
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

// Cajas de recolección de estrellas (GetCandyBoundingBox/GetStarBoundingBox de DX, modelo de PC):
// desfase del centro respecto a la posición del objeto y semiancho/semialto. DX las cruza con
// ObjectsIntersect (rectángulo contra rectángulo), más amplio en diagonal que dos círculos.
const CANDY_STAR_BOX = { dx: 1.5, dy: 0, hw: 56, hh: 52 };    // bb (142, 157, 112, 104) en un lienzo de 393×418
const STAR_BOX       = { dx: -7, dy: -6.5, hw: 41, hh: 41 };  // bb (70, 64, 82, 82) en el cuadro 0 de 236×223

const PROGRESS_KEY = 'ctr_progress_v1';
