# Qué se reutiliza del decomp DX

Catálogo de lo que hay en `/home/camilo/Work/cuttherope-dx` y cómo llevarlo a nuestra versión con p5.js + Matter.js. Las tareas concretas están en [plan-caja1.md](plan-caja1.md).

**Política (2026-10-20): usar todo lo que se pueda del DX**: coordenadas, constantes, reglas, textos, imágenes con sus atlas, sonido y comportamiento de cada mecánica. Las imágenes del juego salen de las hojas del DX (copiadas en `src/assets/images/`, ver §7).

Rutas relativas a la raíz del decomp. Código C# en `src/CutTheRopeDX.Core/`.

**Alcance** de cada elemento:
- **Caja 1**: se usa.
- **Evaluar**: se usaría, pero choca con una decisión del proyecto; hay que decidir antes.
- **Fuera**: fuera de alcance según `CLAUDE.md` (otras cajas, animaciones que no sean de tutorial o de carga).

---

## 1. Cómo conseguir el contenido del DX

El repositorio del decomp trae los mapas, los textos y los atlas JSON, pero **no** las imágenes PNG, los sonidos ni las fuentes. Se descargan en un solo archivo:

- URL: `https://github.com/yell0wsuit/ctrdx-assets/releases/latest/download/ctrdx-assets-vk.zip` (definida en `content/Builder/Commands/AssetCommands.cs:11`).
- `content/file_manifest.json` lista lo que trae el archivo: 226 rutas bajo `images/`, 213 bajo `sounds/` y 5 bajo `fonts/`.
- Cada hoja `images/<nombre>.png` del archivo tiene su atlas en `content/images/<nombre>.json` del repositorio.
- Se descomprime **fuera de nuestro repo**; a `src/` solo se copia lo que usa la Caja 1. Estado (2026-10-21): descargado y extraído sobre `content/` del decomp (`/home/camilo/Work/cuttherope-dx/content/`: PNG en `images/`, sonidos en `sounds/`, fuentes en `fonts/`, junto a los atlas JSON); el zip original está en `/home/camilo/Work/ctrdx-assets-vk.zip`. El `.gitignore` del decomp ignora los PNG.

El README del decomp aclara que es un proyecto de fans no afiliado a ZeptoLab, y que los derechos del juego y sus assets son de ZeptoLab.

## 2. Espacio de coordenadas

Todos los números de este documento están en el espacio DX (mapa × 3), salvo que se indique otra cosa. Con la decisión de la sección 1 del plan (`VIEW = 960×1440`), se pueden usar directamente. Las hojas del DX también están dibujadas para esa escala.

| Dato | Dónde | Valor |
|---|---|---|
| Escala del mapa | `GameMain/GameScene.Show.cs:26` | `mapScale = 3` |
| Pantalla de diseño | `Framework/Platform/ViewportLayout.cs:14-19` | 2560×1440 |
| Centrado horizontal | `GameMain/GameScene.LoadMetadata.cs:96` | `offsetX = (2560 − anchoMapa × 3) / 2`: 800 para mapas de 320, 320 para mapas de 640 |
| Conversión de `grab` | `GameMain/LoadObjects/LoadGrabs.cs:25-27, 99-101` | `x`, `y`, `length` y `radius` (si ≠ −1) × 3 |
| Cámara | `GameMain/GameScene.Show.cs:189-196`, `GameScene.cs:426-427` | Solo se mueve si el mapa × 3 supera 2560×1440 |
| Borde de derrota | `GameMain/GameScene.cs:63-64` | Relativo al tamaño del mapa, no al de la pantalla |

**Tamaño de los mapas de la Caja 1** (`<map width height>` de la capa `settings`): la mayoría mide 320×480, pero los niveles 2, 3, 10, 13, 17, 22 y 24 miden **640×480** y el nivel 15 mide **320×960**. Cómo encajarlos en nuestro `VIEW` es la decisión **D1** de [plan-caja1.md](plan-caja1.md#d1-coordenadas-y-escala).

## 3. Datos

| Qué | Dónde | Uso en p5 | Alcance |
|---|---|---|---|
| Mapas de los 25 niveles | `content/maps/1_1.xml` … `1_25.xml` (capa `Objects`; los tutoriales se repiten en una capa por idioma y se filtran por el atributo `locale`, igual que en `Tutorials/TutorialPromptLoader.cs`: usar `locale="es"`) | Script de conversión → `LEVELS` | Caja 1 |
| Textos en español | `content/locales/es.json` (`TUTORIAL_LVL_1_*` y textos de UI como `STAR_BONUS`) | Copiar las cadenas usadas a `data/` | Caja 1 |
| Lista de cajas y niveles | `content/packlist.json`, `content/ctroriginal_packs.json` | Referencia del orden de la Caja 1 | Caja 1 |

## 4. Constantes

`Framework/PhysicsConstants.cs` y `GameMain/GameScene.cs:820-840`.

| Constante | Valor | Para qué |
|---|---|---|
| `GravityEarthY` | 784 | Gravedad (comentario "9.8 * 80"; hay que confirmar en qué espacio está) |
| `BungeeRestLength` | 105 | Largo de reposo de cada tramo de la cuerda |
| `BungeeRelaxThresholdSoft/Medium/Hard` | 0,3 / 1 / 4 | Niveles de estiramiento por tramo |
| `BungeeStretchRedThreshold` | 7 | Estiramiento a partir del cual la cuerda se pone roja |
| `BubbleImpulseY` / `BubbleImpulseDamping` | −40 / 14 | Empuje y amortiguación de la burbuja |
| `BubbleCaptureRadius` | 85 | Distancia a la que la burbuja atrapa el dulce |
| `BUBBLE_RADIUS` | 60 | Radio de la burbuja |
| `STAR_RADIUS` | 42 | Radio de colisión de la estrella |
| `MOUTH_OPEN_RADIUS` | 200 | Distancia a la que Om Nom abre la boca |
| `ROPE_CUT_AT_ONCE_TIMEOUT` | 0,1 s | Ventana para contar cortes simultáneos |
| `SpikesQuadWidths` | 212 / 333 / 453 / 566 | Largo de colisión de `spike1`–`spike4` |
| `SpikesCollisionBandHalfHeight` | 5 | Semialto de la banda de colisión de las púas |
| `CandyBreakGravityY` | 500 | Gravedad de los trozos del dulce roto |

## 5. Reglas de juego

| Qué | Dónde | Estado en nuestra versión |
|---|---|---|
| Puntaje | `GameMain/LevelResult.cs` | `timeBonus = max(0, 30 − t) × 100`, `starBonus = 1000 × estrellas`, total redondeado hacia arriba. [src/core/rules.js](../src/core/rules.js) usa la misma fórmula, pero redondea el bonus de tiempo hacia abajo a múltiplos de 10, y el límite de 30 s se puede cambiar por nivel (`time`). En DX es siempre 30 s. |
| Pantalla de resultados | `GameMain/BoxOpenClose.cs` (estados `RESULT_STATE_*`) | Muestra el bonus de estrellas y luego descuenta el de tiempo hacia el total. Referencia para el `WinPanel`. |

## 6. Lógica que se porta a JS

No es código para copiar línea por línea: es la referencia del comportamiento y de los valores.

| Qué | Dónde | Cómo llevarlo a p5/Matter | Alcance |
|---|---|---|---|
| Cuerda automática | `GameMain/AutoRadiusSource.cs`, `GameMain/GrabAxisResolver.cs:52-56` | Detección por distancia, cuerda de un solo uso, fade del círculo | Caja 1 |
| Púas | `GameMain/Spikes.cs:75-95` (`UpdateRotation`) | Banda rotada de largo `SpikesQuadWidths[size−1]` y semialto 5 → rectángulo sensor de Matter | Caja 1 |
| Objetos móviles | `Framework/Helpers/Mover.cs` (`FromXml`, `Update`), `ActivePhysicsConstants.cs` (`MoverPathScale = 3`, `DesktopMoverSpeedScale = 3,3`) | Recorrido cíclico por los offsets de `path` (×3) a `moveSpeed × 3,3` px/s; en la Caja 1 solo las púas del nivel 22 y una estrella del 24 | Caja 1 |
| Burbuja | `GameMain/Bubble.cs`, `GameMain/BubbleCapture.cs` | Impulso hacia arriba con amortiguación en lugar de fuerza constante | Caja 1 |
| Cuerda roja | `GameMain/Bungee.cs:195-235` (`StretchLevelFor`), `GameMain/RopeColorHelper.cs` | Nivel de estiramiento por tramo → color | Caja 1 |
| Colores de la cuerda | `GameMain/RopeColorHelper.cs` | Dos colores base alternados por tramo | Caja 1 |
| Dibujo de la cuerda | `GameMain/Bungee.cs:208` + `GameMain/QuadraticBezierSpline.cs` | Bézier que pasa por los puntos de la cuerda | Caja 1 |
| Tutoriales | `GameMain/Tutorials/` (`TutorialPromptLoader`, `TutorialMotion`, `TutorialDirector`, `TutorialTrigger`) | Lectura de `tutorialText`/`tutorialNN`, tiempos de fade, recorrido del dedo (`path`, `moveSpeed`, `repeat`) y qué los dispara | Caja 1 |
| Dulce roto | `GameMain/CandyBreak.cs` | Fragmentos que giran y caen con `CandyBreakGravityY` | Caja 1 |
| Estela del corte | `GameMain/FingerTraces/ClassicFingerTrace.cs` | Cinta Bézier blanca que sigue al ratón y se desvanece | Caja 1 |
| Cortes simultáneos | `ROPE_CUT_AT_ONCE_TIMEOUT` | Contar las cuerdas cortadas en 0,1 s (tutorial del nivel 20) | Caja 1 |
| Pantalla de resultados | `GameMain/BoxOpenClose.cs` | Conteo del bonus de estrellas y de tiempo hacia el total | Caja 1 |
| Cuerda como cadena de puntos | `Framework/Physics/ConstrainedPoint.cs`, `Framework/Physics/MaterialPoint.cs`, `GameMain/Bungee.cs:597-710` | DX usa una cadena de puntos con restricciones de distancia (tramos de 105, 30 iteraciones de relajación); se porta según D2 (Matter queda solo para los sensores); tareas en la §5 del plan. | Caja 1 |
| Om Nom abre la boca | `MOUTH_OPEN_RADIUS`, `GameMain/TargetIdleState.cs`, `TargetFeedingState.cs` | Cambiar de cuadro cuando el dulce está cerca | Fuera (es animación) |

## 7. Imágenes

**Decisión: usar las hojas del DX con sus atlas JSON.** Nuestros `_hd` no coinciden con esos atlas (por ejemplo, `obj_star_idle.json` describe una hoja de 1165×496 y `obj_star_idle_hd.png` mide 512×2048), y como no se usan en el código, se reemplazan.

Formato de los atlas (TexturePacker, JSON array): cada cuadro tiene `frame` (recorte en la hoja), `spriteSourceSize` (desplazamiento del recorte dentro del cuadro original) y `sourceSize` (tamaño original). En p5: `image(hoja, dx + sss.x, dy + sss.y, frame.w, frame.h, frame.x, frame.y, frame.w, frame.h)`.

Hojas de la Caja 1 (PNG en `images/` del archivo de descarga, JSON en `content/images/`):

| Uso | Hoja |
|---|---|
| Fondo del nivel | `backgrounds/bgr_01_p1`, `backgrounds/bgr_01_p2` (2559 px de ancho: hay que recortar o centrar para 960), `bgr_01_cover` |
| Dulce | `candies/obj_candy_01_new`, `candies/obj_candy_fx` |
| Om Nom (un cuadro) y su soporte | `char_animations`, `char_supports` |
| Anclas fijas y automáticas | `obj_hook`, `obj_hook_chain`, `obj_hook_auto_chain` |
| Estrellas | `obj_star_idle`, `obj_star_disappear` |
| Burbujas | `obj_bubble` |
| Púas | `obj_spikes` (una sola hoja para los 4 tamaños) |
| Tutoriales | `tutorial_signs` |
| HUD y pausa | `hud_ui`, `menu_pause`, `obj_pause` |
| Menú de niveles y botones | `menu_level_ui`, `menu_buttons`, `menu_bgr`, `menu_popup` |
| Resultados | `menu_results`, `confetti_particles` |
| Fuentes bitmap | `small_font`, `big_font`, `font_numbers_big` |
| Pantalla de carga | `loaderbar_full`, `menu_processing_hd` |
| Estela del corte | Ninguna: `ClassicFingerTrace` dibuja la cinta sin imágenes (`traces_ctr2` es de otras estelas) |

Estado (2026-10-21): todas las hojas de esta tabla están copiadas en `src/assets/images/` (mismas subcarpetas que en el DX) y se cargan en `preload()` con `Sprites` ([src/ui/sprites.js](../src/ui/sprites.js)). La lista de hojas está en `SPRITE_SHEETS`/`SPRITE_IMAGES`; para dibujar un cuadro: `Sprites.draw('obj_hook', 0, x, y)`.

Animaciones Flash en XML (`content/images/animations/*.xml`: `fx_bubbles`, `fx_cut_chain`, `obj_pause_ani`, `om_nom_*`): **Fuera**, salvo que alguna se use en un tutorial o en la pantalla de carga.

## 8. Sonido

Viene en el archivo de descarga (`sounds/`): WAV para efectos, FLAC para música. Los navegadores actuales reproducen los dos formatos; convertir a OGG/MP3 solo si el peso lo justifica. Se reproduce con Web Audio (ya está en la hoja de ruta de `docs/arquitectura-mvp.md`). Alcance: **Caja 1**.

Efectos de la Caja 1 (`sounds/sfx/`):

| Evento | Archivo |
|---|---|
| Cortar cuerda | `rope_bleak_1.wav` … `rope_bleak_4.wav` |
| Se crea una autocuerda | `rope_get.wav` |
| Estrella 1, 2 y 3 | `star_1.wav`, `star_2.wav`, `star_3.wav` |
| Burbuja atrapa / revienta | `bubble.wav`, `bubble_break.wav` |
| Dulce destruido por púas | `candy_break.wav` |
| Om Nom: abrir / cerrar boca, comer, triste, saludo, emocionado | `monster_open.wav`, `monster_close.wav`, `monster_chewing.wav`, `monster_sad.wav`, `monster_greeting.wav`, `monster_excited.wav` |
| Ganar | `win.wav` |
| Botones / pausa | `tap.wav`, `pause_down.wav`, `pause_up.wav` |
| Música | `sounds/game_music.flac`, `sounds/menu_music.flac` |

## 9. Fuentes

El archivo de descarga trae 5 fuentes en `fonts/`:

- Latinas: `gooddog_new-webfont.ttf` y `PlaypenSans-SemiBold.ttf`. Se pueden cargar en p5 con `loadFont()` para textos largos (tutoriales, menús).
- Coreana, china y japonesa: `Cafe24DongdongRegular.otf`, `KNMaiyuan-Regular.ttf` y `MPLUSRounded1c-Medium.ttf`. No hacen falta.

Para números y títulos cortos están también las fuentes bitmap de la sección 7 (`small_font`, `big_font`, `font_numbers_big`). Falta revisar en el decomp cuál usa cada texto.

## 10. Lo que no se trae

- El renderizado de DX (OpenGL, vértices antialiasados de `Bungee.cs`): en p5 se dibuja con `bezierVertex`/`line`.
- `GameScene.CandyCollision.cs` (choques entre varios dulces), cajas 2 en adelante y todo lo de eventos especiales (Halloween, Navidad, skins).
- La cámara, salvo que la decisión **D1** del plan la necesite (nivel 15 y, según la opción, los mapas de 640).
- `Scorer.cs`: es un stub de logros sin lógica.
