# Plan de acción — Caja 1 (Cardboard Box)

Objetivo: replicar las funcionalidades básicas del primer mundo del juego original (sin copia 1 a 1), jugable en GitHub Pages.

**Convención:** `- [ ]` pendiente. Al terminar una tarea se marca y se tacha: `- [x] ~~tarea~~`. Si una tarea se descarta, se tacha sin marcar y se anota el motivo. Cuando el trabajo lo hacen agentes en paralelo, **las casillas las marca solo quien integra** (ver [Reglas para agentes](#reglas-para-agentes-en-paralelo)); los agentes no editan este archivo. Lo ya terminado se quita del plan; lo que sirva de referencia queda en la definición de lo implementado (decisiones, formato de `LEVELS`, `CLAUDE.md`).

Catálogo de lo reutilizable del decomp (constantes, lógica, imágenes, sonido): [referencia-dx.md](referencia-dx.md).

Referencia: decomp en `/home/camilo/Work/cuttherope-dx` — mapas `content/maps/1_*.xml`, textos `content/locales/es.json`, atlas `content/images/*.json`, lógica `src/CutTheRopeDX.Core/GameMain/`, constantes `src/CutTheRopeDX.Core/Framework/PhysicsConstants.cs`. Assets ya copiados: hojas en `src/assets/images/`, sonidos en `src/assets/sounds/` y fuente en `src/assets/fonts/` (zip original en `/home/camilo/Work/ctrdx-assets-vk.zip`).

---

## Estado actual

> Esta sección es lo primero que se lee al iniciar una sesión. Mantenerla al día cada vez que cambie la fase o se cierre una decisión.

- **Fase actual:** el usuario sacó las 75 estrellas (los 25 niveles con 3 estrellas, §6). Las entidades ya se dibujan con las hojas del DX (§8). Integrados los tutoriales (§7) y el sonido con música y botón de silencio (§11), sin commitear. Falta la estela del corte y la pantalla de resultados animada (§11), y la documentación (§12).

---

## Decisiones cerradas

### D1. Coordenadas y escala

Espacio de la versión DX con el mapa ×3 (`MAP_SCALE = 3`), en un `VIEW` fijo de 1920×1440 (4:3) que `main.js` escala a la ventana. Conversión mapa → `VIEW`: `x * 3 + offsetX`, `y * 3`, `length * 3`, `radius * 3`, con `offsetX = (1920 − anchoMapa × 3) / 2` (480 para mapas de 320, 0 para los de 640). `angle` no cambia. Las franjas laterales de los mapas de 320 se rellenan con el fondo de la caja. Solo el nivel 15 (960×2880) usa cámara vertical (`core/camera.js`, como `StartCamera`/`UpdateCameraTracking` de DX). El borde de derrota es relativo al mapa (`Candy.isOutOfMap`). Gravedad base: `GravityEarthY = 784` px/s², ya en el espacio ×3 porque la Caja 1 usa el modelo de física de PC (la velocidad de simulación está en la §5).

### D2. Cuerda: cadena de puntos de Verlet de DX (reabierta y cerrada el 2026-10-21)

Se porta la física de `Bungee.cs` + `ConstrainedPoint.cs`: cada cuerda es una cadena de puntos de peso 0,02 con tramos de 105 y 30 pasadas de relajación, y el dulce es un punto de Verlet de peso 1 que comparten todas sus cuerdas. Matter se queda **solo para los sensores**: en cada paso la posición del punto del dulce se copia a su body (`Body.setPosition`), así el `collisionStart` de `Game` no cambia. Motivo: en la Caja 1 ningún body es sólido (todos son sensores), así que Matter solo integraba el dulce, y con un `Constraint` por ancla el estiramiento, el balanceo, la curva y los trozos cortados solo se podían imitar; las trayectorias no coincidían con las de los mapas de DX. Antes D2 decía: un `Constraint` de Matter por ancla, sin portar la cadena.

### D3. Textos del tutorial adaptados al ratón

"Arrastra el ratón", "haz clic" (ya adaptados en `texts.js`). El dedo animado del nivel 1 se conserva como gesto de arrastre.

---

## Fase 2 — integración

Se puede hacer en secuencia o con 2–3 agentes en archivos separados.

- [x] Ajuste de física (§5)
- [x] ~~Sprites de las entidades: fondo, dulce, Om Nom y soporte, estrellas, burbujas (§8)~~
- [x] ~~Tutoriales por nivel (§7)~~
- [x] ~~Conectar los eventos de sonido (§11)~~
- [ ] Estela del corte y pantalla de resultados animada (§11)
- [x] ~~Comprobar los 25 niveles con 3 estrellas (tabla de la §6)~~
- [ ] Documentación y entrega (§12)

### Reglas para agentes en paralelo

- Cada agente trabaja en su worktree y rama, y solo cambia los archivos que se le asignen. Si necesita algo fuera de eso, lo pide en su informe final en lugar de hacerlo.
- No editar `docs/plan-caja1.md`. El informe final lista qué tareas del plan quedaron hechas; quien integra las marca al juntar la rama.
- Comprobación mínima antes de terminar:
  - `node --check` sobre cada `.js` cambiado (detecta errores de sintaxis sin navegador)
  - El sitio carga con `python3 -m http.server 8000 -d src`
  - Indicar qué nivel y qué acción sirven para probar el cambio a mano
- La comprobación visual (que se vea y se sienta bien) la hace el usuario al integrar.
- Respetar `CLAUDE.md`: comentarios y textos en español, identificadores en inglés, sin módulos.

---

## Formato de `LEVELS`

`src/data/levels.js` lo genera `tools/convert-maps.py` a partir de las capas `Objects` y `Es` de los 25 mapas; no se edita a mano. Coordenadas ya convertidas al espacio de `VIEW` (D1).

```js
{
  name: 'Nivel 1',
  map: { w: 960, h: 1440 },          // tamaño del mapa ×3 (para el centrado, la cámara y el borde de derrota)
  candy:   { x, y },                  // radio en config.js, no por nivel
  omnom:   { x, y },                  // `target` en el XML
  anchors: [{ x, y, length }],        // `grab` con radius="-1"
  autoAnchors: [{ x, y, radius, length }], // `grab` con radius > 0
  stars:   [{ x, y, path, moveSpeed }],    // en la Caja 1 ninguna tiene tiempo (timeout -1 o 0); path solo en el nivel 24
  bubbles: [{ x, y }],
  spikes:  [{ x, y, size, angle, path, moveSpeed }], // `spike1`–`spike4`; size 1–4, angle en grados; path solo en el nivel 22
  tutorials: [                        // solo los nodos con locale="es"
    { type: 'text', x, y, text: 'TUTORIAL_LVL_1_1_01', width, duration },
    { type: 'sign', sign: 1, x, y, angle, duration },             // tutorialNN → cuadro NN de tutorial_signs
    { type: 'sign', sign: 10, x, y, angle, path: [230, 0, 440, 0],
      moveSpeed, ease, moveDelay, repeat, fadeIn, fadeOut, duration }, // tutorial10 = dedo que desliza
    { type: 'sign', sign: 5, x, y, showOn: 'bubbled', inArea: { x, y, w, h } }, // disparador (nivel 5)
  ],
}
```

- No hay `time` por nivel: el límite es siempre `TUNING.defaultLevelTime` (30 s, como en DX).
- Los campos opcionales que falten en el XML se omiten; el código usa los valores por defecto de DX.
- `text` es la clave de `content/locales/es.json`; las cadenas van en `src/data/texts.js` (`TEXTS`).
- `width` del texto se multiplica por 3 igual que las coordenadas. `inArea` (`"x,y,w,h"` en el XML) se convierte como coordenadas: `x`/`y` ×3 + offset, `w`/`h` ×3.
- **`length` de las cuerdas** es el del mapa ×3. En DX la cuerda real mide 105 más (§5).
- **`path` de objetos (estrellas y púas)**: offsets `[dx, dy, …]` respecto a `x, y`, ya ×3 (`MoverPathScale = 3`); se quita la coma final del XML. Como en `Mover.cs`, el objeto recorre en ciclo el punto inicial y los del `path` (con un solo offset va y vuelve). `moveSpeed` se guarda tal cual; la velocidad en px/s de `VIEW` es `moveSpeed × 3,3` (`DesktopMoverSpeedScale`, modelo de PC).
- **`path` del dedo (`tutorial10`)**: offsets que **no** se escalan (DX los usa ya en espacio ×3, `TutorialMotion.cs`), igual que su `moveSpeed`.
- `showOn` (por defecto `start`) e `inArea` solo aparecen en el nivel 5 (`showOn="bubbled"`: el tutorial sale cuando el dulce queda en una burbuja dentro del área).
- Se ignoran porque en la Caja 1 siempre tienen el valor neutro: `wheel`, `gun`, `spider`, `moveLength` (−1 o 0), `moveVertical`, `moveOffset`, `part`, `hidePath` de `grab`; `toggled="false"` de las púas; `moveSpeed`/`rotateSpeed` de los signos sin `path`; y de la capa `settings`, `twoParts` = false. `ropePhysicsSpeed` (= 1 en la Caja 1) no se lee del mapa, pero **no es neutro**: DX lo multiplica por 1,4 (§5).

---

## 5. Ajuste de física al original

Según D2 (Verlet de DX; Matter solo para sensores). Las tareas 1–4 van juntas en un mismo cambio, porque hasta que estén todas el dulce no se mueve.

- [x] ~~**Punto de Verlet (`ConstrainedPoint`).** Archivo nuevo `core/verlet.js` (o `entities/`), cargado en `index.html` antes de `rope.js`, con `pos`, `prevPos`, `weight`/`invWeight`, `pin`, sus restricciones (`DISTANCE`, `NOT_MORE_THAN`) y `satisfyConstraints()` (`ConstrainedPoint.cs:215-275`). Dos integradores, como en DX: el del dulce usa `delta²` (`ConstrainedPoint.Update`, `ConstrainedPoint.cs:181-209`, modelo de PC) y el de los puntos de la cuerda `delta × 0,016` (`Qcpupdate`, `ConstrainedPoint.cs:283-305`). Ninguno amortigua la velocidad, así que el `frictionAir` del dulce desaparece.~~
- [x] ~~**Cuerda como cadena (`Bungee`).** Reescribir `entities/rope.js`: ancla fijada con `pin`, cola = el punto del dulce, primer tramo de `BUNGEE_REST_LEN` = 105 y `RollplacingWithOffset(len)` intercalando puntos de peso 0,02 cada 105 (`Bungee.cs:606-645`, `693-725`). Por eso el largo en reposo es `length × 3 + 105` (nivel 2: 270 → 375, 510 → 615 y 960 → 1065). `update()` integra sus puntos salvo la cola y hace 30 pasadas de relajación (`Bungee.cs:871-900`). Se quitan `updateTension()`, el truco de `stiffness` 0/1 y la Bézier calculada a partir de la holgura: la forma son los puntos (dibujados como una sola Bézier con todos los puntos como control, `DrawHelper.CalcPathBezier`), y el rojo por tensión sale del largo real del primer tramo (`StretchLevelFor`, `Bungee.cs:195-235`). La cuerda automática usa el mismo constructor.~~
- [x] ~~**Corte como en DX.** `tryCut()` interseca el arrastre con los tramos de la cadena y, como `CutWithRazorOrLine1Line2Immediate`, un arrastre corta como mucho una cuerda; `SetCut(part)` + `RemovePart(part)` (`Bungee.cs:782-830`) quitan la restricción de ese tramo, ponen un punto suelto de peso 1e-5 al final del trozo del ancla y dejan todos los puntos de la cuerda con peso 1e-5; los dos trozos siguen simulándose y se desvanecen con `cutTime` = 2. Desaparecen los bodies `rope-piece` de Matter.~~
- [x] ~~**Paso de simulación y velocidad 1,4.** En `Game.update()`, en el orden de DX (`GameScene.Update.cs:190-210` y `340-360`): primero cada cuerda con `delta × ropePhysicsSpeed`, luego el punto del dulce con el mismo `delta`, y después se copia su posición al body de Matter (`Body.setPosition` y velocidad 0) antes de `Engine.update`, que ya solo sirve para los sensores. `ropePhysicsSpeed` = 1 × `RopePhysicsSpeedMultiplier` 1,4 (`GameScene.LoadMetadata.cs:170`, `PhysicsConstants.cs:15`), así que la gravedad efectiva del dulce es 784 × 1,4² ≈ 1537 px/s². La gravedad del mundo de Matter pasa a 0. Los `Mover` (púas del 22, estrella del 24) se quedan con `delta` sin acelerar. Paso fijo de 1/60 s como hasta ahora. Pruebas: nivel 1, la caída tras cortar; nivel 2, al cortar la cuerda izquierda el dulce pasa por las estrellas.~~
- [x] ~~**Burbuja sobre el punto.** Quitar `applyForce` + `bubbleFrictionAir` y aplicar a cada paso `ApplyImpulseDelta((−v.x / 14, −v.y / 14 + −40), delta)` al punto del dulce (`GameScene.Update.cs:1493-1506`, `MaterialPoint.cs:102-109`; `BubbleImpulseY = -40`, `BubbleImpulseDamping = 14`).~~
- [x] ~~Actualizar la sección "Cuerdas" de `CLAUDE.md` y los diagramas de cuerda y corte de `docs/arquitectura-mvp.md`.~~
- [x] ~~**Comprobación visual del port** (usuario): nivel 1, el dulce cae ~64 px al empezar (la cuerda nace floja), se balancea un poco y al cortar pasa por las 3 estrellas; nivel 2, al cortar la izquierda pasa por las estrellas 1 y 3; la cuerda se pone blanca un instante al cortarla y los trozos caen y se desvanecen; nivel 5, el dulce sube con la burbuja. En una simulación sin navegador (Node, mismas fórmulas) el dulce del nivel 1 cuelga a 378 px del ancla (reposo 375), cae a ~1580 px/s² tras el corte (DX: 1537) y pasa a 17 px de las estrellas y a 23 px de Om Nom; en el nivel 2 pasa a 41 y 34 px de las estrellas 1 y 3.~~
- ~~Revisar que la burbuja capture al dulce al tocarla (`BubbleCaptureRadius`) y no solo por colisión exacta. Prueba: nivel 5.~~ Descartada: el usuario considera bien hecha la captura actual.
- ~~Radio del dulce contra las púas: DX usa 15 y aquí choca con `CANDY_RADIUS` 54, así que el pasillo del nivel 16 queda en ~180 px en vez de ~260.~~ Descartada: el usuario considera bien hecho el radio actual.

## 6. Los 25 niveles

Cada nivel se marca cuando se comprobó que se puede ganar con 3 estrellas.

| ✓ | Nivel | Mapa | Cuerdas fijas | Autocuerdas | Burbujas | Púas | Tutorial |
|---|---|---|---|---|---|---|---|
| [x] | 1  | 320×480 | 1 | – | – | – | sí |
| [x] | 2  | **640×480** | 3 | – | – | – | sí |
| [x] | 3  | **640×480** | 3 | – | – | – | – |
| [x] | 4  | 320×480 | 4 | – | – | – | – |
| [x] | 5  | 320×480 | 2 | – | 1 | – | sí |
| [x] | 6  | 320×480 | 1 | – | 1 | – | sí |
| [x] | 7  | 320×480 | 6 | – | – | – | – |
| [x] | 8  | 320×480 | 2 | – | 1 | – | sí |
| [x] | 9  | 320×480 | 3 | – | 1 | – | – |
| [x] | 10 | **640×480** | 1 | 3 | – | – | sí |
| [x] | 11 | 320×480 | 3 | 4 | – | – | – |
| [x] | 12 | 320×480 | 2 | 2 | – | – | sí |
| [x] | 13 | **640×480** | 2 | – | 3 | – | – |
| [x] | 14 | 320×480 | 1 | 1 | 2 | – | sí |
| [x] | 15 | **320×960** | 1 | 5 | 1 | – | – |
| [x] | 16 | 320×480 | 4 | – | – | 2 | sí |
| [x] | 17 | **640×480** | 4 | – | – | 2 | – |
| [x] | 18 | 320×480 | 5 | – | – | 2 | – |
| [x] | 19 | 320×480 | – | 2 | 1 | 2 | – |
| [x] | 20 | 320×480 | 2 | 2 | – | 2 (80°/100°) | sí |
| [x] | 21 | 320×480 | 4 | – | 2 | – | – |
| [x] | 22 | **640×480** | 3 | – | 2 | 2 (móviles) | – |
| [x] | 23 | 320×480 | 6 | – | 1 | 2 | – |
| [x] | 24 | **640×480** | 3 | – | – | – | – |
| [x] | 25 | 320×480 | 2 | 4 | 1 | 2 | – |

Objetos con `path`: las dos púas del nivel 22 y una estrella del nivel 24.

Ajuste respecto al mapa de DX: en el nivel 22 la cuerda del ancla central tiene `length` 273 en vez de 300 (27 px menos, medio radio del dulce). Con 300, al cortar las dos cuerdas laterales el dulce colgaba hasta Om Nom y el nivel se ganaba sin las estrellas de los lados.

## 7. Tutoriales

Los datos de cada nivel ya están en `levels.js`/`texts.js` y los dibuja `ui/tutorial.js`. Comportamiento de referencia en `GameMain/Tutorials/` del decomp.

- [x] ~~Fuente del texto: asignar `Tutorial.font` (en DX los tutoriales usan SmallFont; las fuentes bitmap están en `ui/fonts.js`). Con la fuente por defecto, en el nivel 1 la última línea se monta sobre las flechas~~
- [x] ~~Comprobar que el texto y los signos salen como en DX en los niveles 2, 5, 6, 8, 10, 12, 14, 16 y 20. El 8 señala el botón Reiniciar; el 14 habla de Saltar nivel en el menú de pausa (texto solo en `en.json`); el 20 lleva una fila de 5 flechas (`tutorial01`)~~

## 8. Gráficos con las hojas del DX

Sprites estáticos con `Sprites.draw` (ver `CLAUDE.md`); las animaciones de personaje quedan fuera de alcance. Hojas y atlas: [referencia-dx.md §7](referencia-dx.md#7-imágenes).

Los cuadros de cada hoja están en `GFX_T` (`config.js`).

- [x] ~~Fondo del nivel (`backgrounds/bgr_01_p1`, `bgr_01_p2`), también en las franjas laterales (D1)~~: `Level.drawBackground()`, `bgr_01_p1` centrado y repetido hacia abajo, y `bgr_01_p2` en la costura (y = 1120, solo en el nivel 15). `bgr_01_cover` no es fondo de nivel en DX (es la tapa de la caja; ya la usa `drawBoxCover`)
- [x] ~~Dulce (`candies/obj_candy_01_new`)~~: cuadros 0–2 a escala 0,71
- [x] ~~Om Nom estático (`char_animations`, un cuadro) y su soporte (`char_supports`)~~
- [x] ~~Estrellas (`obj_star_idle`, primer cuadro)~~: brillo (cuadro 0) y estrella (cuadro 1)
- [x] ~~Burbujas (`obj_bubble`)~~: mancha en la pared (cuadro 1–3 al azar, se queda tras la captura) y burbuja (cuadro 0); con el dulce dentro, cuadro 4 encima del dulce
- [x] ~~Orden de dibujo como DX en `Level.draw`: tutoriales encima de Om Nom y debajo de burbujas, estrellas, cuerdas y dulce (hoy van al fondo; obliga a dibujar a Om Nom antes que las cuerdas)~~

## 10. UI y flujo

- [ ] Pantalla de título
- [ ] Creditos de los estudiantes (no implementando en DX es completamente nuevo)

## 11. Más elementos del DX

Detalle y referencias en [referencia-dx.md](referencia-dx.md). El módulo de sonido es `core/audio.js` (tabla nombre → archivo → evento al principio del archivo; `Sound.play`, `Sound.playMusic`, `Sound.toggleMute`).

- [x] ~~Música de menú y de juego según el estado, con botón para silenciar en la UI~~
- [x] ~~Conectar los eventos de sonido: corte, autocuerda, estrellas, burbuja, dulce roto, Om Nom, victoria, botones y pausa~~
- [ ] Estela blanca del corte que sigue al ratón (`ClassicFingerTrace.cs`)
- [ ] Pantalla de resultados con conteo animado de bonus (`BoxOpenClose.cs`)

## 12. Documentación y entrega

- [ ] Actualizar `docs/arquitectura-mvp.md`: quitar soporte táctil, constantes sueltas y métodos movidos a `ProgressStore`/`Hud`/`WinPanel`/`Banner`
- [ ] Documentar en `docs/arquitectura-mvp.md` las entidades nuevas (autocuerda, púas, tutorial) y la transformación de coordenadas
- [ ] Probar los 25 niveles en el sitio publicado en GitHub Pages
