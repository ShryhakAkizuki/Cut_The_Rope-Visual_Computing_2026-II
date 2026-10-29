// Espacio de juego de la versión DX: el mapa ×3, centrado en un VIEW fijo de 4:3.
const VIEW = { w: 1920, h: 1440 };
const MAP_SCALE = 3;

const COLORS = {
  rope:  [220, 220, 220],
};

const STATE = {
  TITLE:   'TITLE',     // pantalla de título (menú principal de DX)
  CREDITS: 'CREDITS',
  MENU:    'MENU',      // menú de niveles
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
// Cuerdas automáticas (AutoRadiusSource.cs y Grab.DrawBack de DX)
const AUTO_ROPE_T = {
  grabPadding:       42,               // CandyGrabPadding (modelo de PC): margen del radio y largo extra de la cuerda
  fadeRatePerSecond: 1.5,              // alpha que pierde el círculo por segundo tras unirse
  circleColor:       [51, 128, 230],   // RGBA(0.2, 0.5, 0.9)
  circleLineWidth:   6,                // DrawGrabCircle: semiancho 3
};

// Púas (incluye el Mover)
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

// Sonido
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

  // Momentos de los sonidos de Om Nom en DX (GameScene.Update, LoadTarget, GameLost)
  mouthOpenDistance: 200,     // MouthOpenDistance (modelo de PC): abre la boca con el dulce a menos de esto
  mouthCloseDelay:   1,       // TryOpenMouth/AdvanceMouthClose: s mínimos con la boca abierta
  greetDelay:        1.3,     // LoadTarget: el saludo llega 1,3 s después de cargar el nivel
  sadDelayAfterBreak: 0.3,    // BreakCandyBody: ScheduleGameLost(0,3) antes del sonido triste
  omnomVoiceChance:  0.5,     // PlayOmNomSound: saludo y emoción suenan la mitad de las veces
};

// Botón de silencio con menu_options_packed, como CreateAudioElementForQuadwithCrosspressediconOffset
// de DX: fondo (0 normal, 1 presionado), icono de sonido (2) y, si está silenciado, el icono a
// RGBA(0.5, 0.5, 0.5, 0.5) con la cruz (4) en su esquina inferior derecha.
const SOUND_BUTTON_T = {
  sheet:      'menu_options_packed',
  upQuad:     0,
  downQuad:   1,
  iconQuad:   2,
  crossQuad:  4,
  iconScale:  0.65,           // el icono (153×141) llena casi todo el alto del fondo (173): se reduce para que quepa
  pauseGap:   5,              // VBox del menú de pausa: la fila de audio va debajo de los botones
  menuMargin: 30,             // menú de niveles (DX lo tiene en Opciones): esquina superior izquierda
};

// Tutoriales
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

// HUD, menús, resultados y pantalla de carga. Las posiciones de DX están en su
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

// Pantalla de título y créditos (MenuController.CreateMainMenu y
// CreateBackgroundWithLogowithShadow de DX). Posiciones en VIEW; las del logo, relativas a él.
const MENU_T = {
  bgrScale:        1.25,      // menu_bgr (fondo y franja de papel) a 1,25, anclado abajo al centro
  shadowScale:     2,         // menu_bgr_shadow a 2, girando de 45° a 405° en 75 s
  shadowStartDeg:  45,
  shadowPeriod:    75,
  logoY:           55,        // logo: arriba al centro, 55 px más abajo
  logoScale:       1.9,       // [nuevo] cut_the_rope_logo.png mide 403×369; a ×1,9 ocupa lo que el logo de DX
  buttonsBottom:   85,        // VBox de botones: abajo al centro, y = -85
  buttonGap:       5,
  fadeMs:          300,       // [nuevo] fundido desde negro al cambiar de pantalla de menú
  backQuadUp:      0,         // menu_extra_buttons: botón Atrás (abajo a la izquierda)
  backQuadDown:    1,
  // Créditos [nuevo, DX no tiene esta pantalla]: panel menu_popup centrado
  popupScale:      1.45,
  popupCenterY:    690,
  titleScale:      1.1,
  courseScale:     0.55,
  headingScale:    0.7,
  nameScale:       0.62,
  nameRowMax:      100,       // alto máximo de cada fila de nombres
  nameColumnsFrom: 7,         // a partir de 7 nombres, dos columnas
  footerScale:     0.42,
  omnomX:          1640,      // Om Nom sentado junto al panel
  omnomY:          1190,
};

// Animación de Om Nom en los niveles (hoja HD migrada; estados en data/omnom-animation.js).
// El sprite se estira a un cuadrado como en DX; 203 px es el ancho del cuadro del idle del
// atlas anterior, así que Om Nom conserva el tamaño que tenía.
const OMNOM_T = {
  sheet:            'char_animations_hd',
  spriteSize:       203,
  spriteOffsetY:    10,    // centro del cuadro respecto a (x, y); así queda apoyado en el soporte
  mouthOffsetY:     40,    // centro visual de la boca respecto a (x, y)
  mouthSensorRadius: 1,    // la boca es un sensor: el dulce se come cuando su centro llega a ella
  winShowDelay:     1.5,   // s de masticado antes de que aparezca el panel de resultados
};

// Sprites estáticos de las entidades con las hojas del DX (cuadros de cada atlas)
const GFX_T = {
  bgP2Y:          1120,       // boxBackgroundP2Y de la Caja 1: bgr_01_p2 tapa la costura entre dos bgr_01_p1
  candyScale:     0.71,       // CreateCandyVisual: obj_candy_01_new se dibuja al 71 %
  candyQuads:     [0, 1, 2],  // fondo, cuerpo y brillo, en ese orden
  supportQuad:    0,          // char_supports: sittingPlatform de la Caja 1
  starGlowQuad:   0,          // obj_star_idle: brillo (ImgObjStarIdleGlow)
  starQuad:       1,          // primer cuadro de la animación de la estrella (1–18)
  bubbleQuad:     0,          // obj_bubble: burbuja libre
  bubbleStainFirst: 1,        // LoadBubble: mancha de la pared, RND_RANGE(1, 3)
  bubbleStainLast:  3,
  bubbleOnCandyQuad: 4,       // BubbleAnimationFactory: primer cuadro de la burbuja con el dulce (4–16)
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
