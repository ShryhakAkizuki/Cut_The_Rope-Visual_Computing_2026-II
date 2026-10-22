# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Proyecto

Recreación de *Cut the Rope* en el navegador para el curso Visual Computing 2026-II. JavaScript plano + **p5.js** (render, input, game loop) + física de Verlet portada de DX ([src/core/verlet.js](src/core/verlet.js)) + **Matter.js** (solo detección de sensores). Sitio 100% estático: no hay `package.json`, bundler, linter ni tests. El código, comentarios, textos de UI y commits están en español; los identificadores en inglés.

## Comandos

```bash
# Correr en local (src/ es la raíz del sitio)
python3 -m http.server 8000 -d src    # luego abrir http://localhost:8000
```

Deploy: cada push a `main` dispara [.github/workflows/deploy.yml](.github/workflows/deploy.yml), que copia `src/` tal cual y lo publica en GitHub Pages. Rollback = revertir el commit y hacer push.

## Arquitectura

### Carga por `<script>` globales, sin módulos

No hay `import`/`export`: cada archivo declara clases/constantes globales y [src/index.html](src/index.html) los carga en orden de dependencia (`data/` → `core/verlet.js` → `entities/` → `ui/` → `core/level.js` → `camera.js` → `progress.js` → `rules.js` → `audio.js` → `game.js` → `main.js`). **Un archivo nuevo debe agregarse a ese bloque de `<script>` en la posición correcta**, o sus globales no existirán cuando se usen.

### Capas

- [src/core/main.js](src/core/main.js) — adaptador p5 sin lógica: `setup`/`draw`/`mouseDragged`/`mousePressed`/`keyPressed` delegan a `Game` (`update(dt)`, `draw(mx, my)`, `onCutAttempt(p1, p2)`, `onInput(x, y)`, `onKeyDown(key)`). También acota `deltaTime` a `TUNING.maxFrameDeltaMs` y conecta `visibilitychange` → `autoPause`/`autoResume`.
- [src/core/game.js](src/core/game.js) — `Game`: máquina de estados (`STATE`: `MENU`, `PLAYING`, `PAUSED`, `WIN`, `LOSE`), dueño del `Matter.Engine`, listener único de `collisionStart`, reloj, puntaje, burbujas y reparto de clics según estado. Delega UI a `Hud`/`WinPanel`/`Banner` ([src/ui/overlays.js](src/ui/overlays.js)), progreso a `ProgressStore` ([src/core/progress.js](src/core/progress.js), `localStorage` key `ctr_progress_v1`) y puntaje a `calculateScore()` ([src/core/rules.js](src/core/rules.js)).
- [src/core/level.js](src/core/level.js) — `Level` traduce un objeto de `LEVELS` en entidades, las añade al mundo y las dibuja. `clear()` vacía el mundo entero (`Composite.clear`); todo reinicio pasa por `restart()` → `startLevel(idx)`, que reconstruye el nivel desde cero.
- [src/core/verlet.js](src/core/verlet.js) — `VerletPoint`, port de `ConstrainedPoint`/`MaterialPoint` de DX: integración de Verlet sin amortiguación, `pin`, restricciones de distancia y `satisfyConstraints()`. Lo usan el dulce (`candy.point`) y las cuerdas.
- [src/entities/](src/entities/) — cada entidad envuelve un `Body` de Matter (sensor) y sabe dibujarse; no toma decisiones de juego (las decide `Game`).
- [src/data/](src/data/) — `config.js` centraliza constantes (`VIEW` 1920×1440, `MAP_SCALE`, `COLORS`, `STATE`, `TUNING`, `ROPE_T`, `CAMERA_T`, radios de colisión `*_RADIUS`, `PROGRESS_KEY`); `levels.js` contiene `LEVELS`, solo datos.

### Convenciones clave

- **Verlet mueve, Matter detecta, p5 dibuja.** Ningún body de Matter es sólido y la gravedad de Matter es 0; no se usa `Matter.Render`. Paso fijo por frame (`TUNING.stepSeconds` = 1/60), en el orden de `GameScene.Update` de DX: `rope.update(delta × ropePhysicsSpeed)` para cada cuerda, `candy.point.update(delta × ropePhysicsSpeed)` (con `ropePhysicsSpeed` = 1,4), impulso de la burbuja, `candy.syncBody()` (copia el punto al body sensor) y `Engine.update(engine, 1000/60)`. Los `Mover` avanzan con `delta` sin acelerar.
- **Las colisiones se identifican por `label`** del body (`candy`, `bubble`, `omnom`, `spikes`). Burbujas, anclas y OmNom son sensores estáticos. Las estrellas no tienen body: como `ObjectsIntersect` de DX, `Game.update()` cruza la caja del dulce (`CANDY_STAR_BOX`, 112×104) con la de cada estrella (`STAR_BOX`, 82×82) con `star.touches()` antes de `Engine.update`, así una estrella tocada en el mismo frame de la victoria cuenta. Las autocuerdas tampoco tienen body (detección por distancia).
- **Estados terminales/pausa congelan todo**: `update()` hace return temprano fuera de `PLAYING` (no avanza física ni reloj).
- **Agregar un nivel = solo datos** en `LEVELS`: `candy`, `anchors` (cada una con `length` opcional para holgura), `omnom`, y opcionales `stars`, `bubbles`, `time` (por defecto `TUNING.defaultLevelTime`). Menú, desbloqueo y botón Next ya escalan.
- **Nueva mecánica** sigue el patrón: entidad con body sensor + `label` en `entities/`, construida en `Level.build`, reacción en el `collisionStart` de `Game`, fuerzas o impulsos sobre `candy.point` en `Game.update()` (como la burbuja).

### Cuerdas ([src/entities/rope.js](src/entities/rope.js))

Lo más delicado del código; es un port de `Bungee.cs` (D2). Cada cuerda es una cadena de `VerletPoint`: `head` fijado en el ancla, puntos de peso `ROPE_T.partWeight` (0,02) cada `restSegmentLength` (105) y `tail` = `candy.point`, que comparten todas las cuerdas del dulce (peso 1). `create()` + `roll()` reproducen `InitWithHeadAtXYTailAtTXTYandLength`/`RollplacingWithOffset`, así que el largo en reposo es `length + 105`. Las restricciones las guarda el punto del lado del dulce y apuntan al anterior. `update(delta)` integra los puntos de la cuerda (`updateRopePart`, delta × 0,016) y hace `relaxationTimes` (30) pasadas de `satisfyConstraints()`; el estiramiento bajo carga sale de ahí, no hay `stiffness`. `tryCut()` interseca el arrastre con los tramos entre puntos; `setCut()` la deja un instante en blanco y `removePart()` separa los trozos (punto suelto + pesos 1e-5), que siguen simulándose y se desvanecen con `cutTime`; `release()` suelta la cuerda del dulce al acabar el fade o al romperse el dulce. Se dibuja como la Bézier de De Casteljau de DX (`pathBezier`, todos los puntos como control) con el rojo según el largo del primer tramo.

## Al iniciar una sesión

En la primera respuesta de cada sesión, antes de cualquier otra cosa, lee la sección **"Estado actual"** de [docs/plan-caja1.md](docs/plan-caja1.md) y dile al usuario en pocas líneas:

1. En qué fase está el proyecto.
2. Qué decisiones abiertas (D1, D2, …) le corresponden al usuario y siguen sin cerrar.
3. Cuáles son las próximas tareas y cuáles se pueden lanzar en paralelo con agentes.

Después sigue con lo que haya pedido el usuario. Cuando cambie la fase o se cierre una decisión, actualiza "Estado actual" en el mismo cambio.

## Objetivo actual: Caja 1 (Cardboard Box)

**Plan de acción: [docs/plan-caja1.md](docs/plan-caja1.md)** (estado, decisiones cerradas, tareas pendientes de la fase 2, reglas para agentes en paralelo y formato de `LEVELS`). Qué se puede reutilizar del decomp (constantes, lógica, imágenes, sonido) y dónde está: [docs/referencia-dx.md](docs/referencia-dx.md).

**Política: usar todo lo que se pueda del DX**: coordenadas, constantes, reglas, textos, imágenes con sus atlas JSON, sonido y comportamiento de las mecánicas. Las imágenes salen de las hojas del DX; los PNG y sonidos se descargan aparte, fuera del repo (sección 1 de `referencia-dx.md`), y a `src/assets/` solo se copia lo de la Caja 1. Las hojas ya están en `src/assets/images/` (PNG + atlas JSON) y se dibujan con `Sprites.draw(hoja, cuadro, x, y)` de [src/ui/sprites.js](src/ui/sprites.js), que carga en `preload()` solo lo de la pantalla de carga (`Sprites.preloadBoot()`, hojas de `BOOT_SHEETS`) y el resto desde `setup()` con `Sprites.loadAll()` mientras `main.js` dibuja la barra de progreso; `Game` se crea al terminar. Una hoja nueva se añade a `SPRITE_SHEETS` (o `SPRITE_IMAGES` si no tiene atlas).

**Casillas del plan:** al completar una tarea, márcala y táchala en el mismo cambio (`- [ ] tarea` → `- [x] ~~tarea~~`). Las tareas descartadas se tachan sin marcar, con el motivo. **Excepción con agentes en paralelo:** los agentes no editan el plan; listan en su informe las tareas hechas y quien integra la rama las marca. Las reglas completas están en la sección "Reglas para agentes en paralelo" del plan.

Replicar las funcionalidades básicas del primer mundo del juego original, sin copia 1 a 1, jugable en línea vía GitHub Pages. Fuera de alcance: las demás cajas y las animaciones que no sean de tutorial o de carga.

Referencia de comportamiento: el decomp en `/home/camilo/Work/cuttherope-dx` (C#). Mapas de la caja en `content/maps/1_1.xml` … `1_25.xml` (tamaño declarado en `<map width height>` de la capa `settings`: casi todos miden 320×480, pero los niveles 2, 3, 10, 13, 17, 22 y 24 miden 640×480 y el 15 mide 320×960); constantes en `src/CutTheRopeDX.Core/Framework/PhysicsConstants.cs`; lógica en `src/CutTheRopeDX.Core/GameMain/` (`Bungee.cs`, `Bubble.cs`, `Grab.cs`, `AutoRadiusSource.cs`, `Spikes.cs`).

**Coordenadas (D1, implementado):** se adopta el espacio de la versión DX, con el mapa ×3 (`MAP_SCALE = 3`). `VIEW` es fijo de 1920×1440 (4:3); `main.js` escala el canvas a la ventana con `viewScale` y convierte el ratón con `toView()`, así que `Game` siempre trabaja en coordenadas de `VIEW`. Conversión: `x * 3 + offsetX`, `y * 3`, `length * 3`, `radius * 3`, con `offsetX = (1920 − anchoMapa × 3) / 2` (480 para mapas de 320, 0 para los de 640). Solo el nivel 15 (960×2880) usa la cámara vertical de [src/core/camera.js](src/core/camera.js); `Game` pasa la entrada por `camera.toWorld()` y dibuja el nivel con `translate(0, -camera.y)`. **Cuerda (D2, implementado):** cadena de puntos de Verlet portada de `Bungee.cs`/`ConstrainedPoint.cs`; Matter queda solo para los sensores (la posición del dulce se copia a su body en cada paso). Ver "Cuerdas".

Mecánicas de la Caja 1 según los mapas:
- `grab` con `radius="-1"`: cuerda fija con `length` (ya implementada).
- `grab` con `radius` de 45 a 80: **cuerda automática**; crea la cuerda cuando el dulce entra al radio. Es de un solo uso y luego el círculo se desvanece (pendiente).
- `bubble` (ya implementada, con el impulso hacia arriba amortiguado de DX).
- `spike1`–`spike4` con `size` y `angle` (casi siempre 0/90; el nivel 20 usa 80/100): **púas** a partir del nivel 16; tocarlas destruye el dulce (pendiente). Las dos del nivel 22 se mueven con `path`/`moveSpeed` (`Mover.cs`).
- `star` sin `timeout` (ya implementada). Una estrella del nivel 24 se mueve con `path`/`moveSpeed` (pendiente).
- Tutoriales en los niveles 1, 2, 5, 6, 8, 10, 12, 14, 16 y 20 (pendiente).
- En la Caja 1 no hay cojines de aire, arañas, ruedas, anclas móviles ni pistolas.


## Documentación existente y desfases

[docs/arquitectura-mvp.md](docs/arquitectura-mvp.md) tiene diagramas (estados, clases, game loop, corte) y la hoja de ruta post-MVP (sonido con Web Audio, viento, más niveles, HUD, partículas, canvas responsivo). Está parcialmente desactualizada respecto a la refactorización reciente:

- Describe soporte táctil (`touchStarted`/`touchMoved`, `TOUCH_MOUSE_GUARD_MS`), pero se **eliminó** en el commit "Remove Touch (Doesn't Work)"; hoy solo hay ratón y teclado.
- Menciona constantes sueltas (`STAR_POINTS`, `BUBBLE_LIFT`, `MAX_FRAME_DELTA_MS`, …) que ahora viven en `TUNING`/`ROPE_T` de `config.js`, y métodos de `Game` (`loadProgress`, `drawHud`, `drawWinPanel`, …) que se movieron a `ProgressStore`, `Hud`, `WinPanel` y `Banner`.

Si cambias la arquitectura, actualiza también ese documento.
