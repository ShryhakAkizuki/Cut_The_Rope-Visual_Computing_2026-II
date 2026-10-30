# 2. Física y mecánicas

Cómo se mueve y se detecta cada cosa. Los valores se ajustan con los de Cut the Rope DX y están centralizados en [`src/data/config.js`](../src/data/config.js).

Documentos relacionados: [arquitectura](01-arquitectura.md) · [niveles](03-niveles.md).

---

## 1. Modelo

- **Matter.js** solo detección de sensores: los cuerpos no son sólidos ni sienten gravedad (`engine.gravity.y = 0`); se usan únicamente para saber cuándo el dulce toca a Om Nom, una burbuja o unas púas (ver [arquitectura §1.3](01-arquitectura.md)).
- **Verlet** ([`src/core/verlet.js`](../src/core/verlet.js)): una cuerda se estira, se balancea y, al cortarla, cada trozo sigue cayendo. Con los cuerpos rígidos de Matter eso solo se podía imitar; así lo hace Cut the Rope DX para que la sensación sea igual a la del juego original.
- **p5.js** impulsa la simulación en frames de 1/60 s (`TUNING.stepSeconds`). Las cuerdas y el dulce avanzan con un paso 1,4 veces mayor (`TUNING.ropePhysicsSpeed`) para que el balanceo se sienta más fluido.

## 2. Puntos y restricciones

Cada punto (`VerletPoint`) recuerda dónde estaba (`prevPos`) y dónde está ahora; la diferencia es su velocidad implícita. La integración es el clásico Verlet: `pos += (pos − prevPos) + gravedad · Δt²`.

- Un punto puede quedar **fijo** (`pin`, como el gancho); entonces las restricciones solo corrigen al otro extremo.
- Los puntos se unen por **restricciones de distancia**: si dos puntos se alejan o se acercan de más, cada uno se corrige en proporción a su peso inverso — más se mueve el más liviano.
- Cada paso, `Rope.update` integra a todos los puntos y luego repite `satisfyConstraints` `ROPE_T.relaxationTimes` (30) veces para que la cadena se asiente.

## 3. Cuerdas

Una cuerda ([`src/entities/rope.js`](../src/entities/rope.js)) es una fila de puntos livianos (`ROPE_T.partWeight = 0.02`) entre el gancho y el dulce, que es mucho más pesado y comparte todas sus cuerdas en el mismo punto Verlet.

- La longitud pedida en el nivel se reparte en segmentos de `ROPE_T.restSegmentLength` (105): la cuerda nace con el tamaño variable exacto, floja o justa según el nivel.
- No hay un valor de elasticidad explícito: la cuerda se estira porque los puntos se corrigen entre sí, y eso produce el balanceo.
- **Dibujo:** se muestrea una curva suave (interpolación de De Casteljau, `ROPE_T.samplesPerSegment`) y se pinta con franjas de dos colores (`color1`/`color2`). Cuando un segmento supera `restSegmentLength + stretchRedThreshold`, la cuerda se tiñe de roja para advertir que está a punto de romperse.

### Corte

El arrastre del ratón se convierte en un segmento (transformado a mundo si hay cámara) y se prueba contra cada cuerda, en orden; se corta la primera que se toque, como mucho una por arrastre.

1. La cuerda marca el punto de corte y queda un instante en blanco (`ROPE_T.cutTime`).
2. Poco después, el punto cortado se sustituye por un **stub** casi sin peso (`ROPE_T.cutPartWeight = 1e-5`) y el resto de la cadena pierde peso: los trozos ya no tiran del dulce.
3. Los trozos siguen cayendo por gravedad mientras se desvanecen (`cutFadeTime`).
4. Al desaparecer, `release()` suelta al dulce quitándole las restricciones de esa cuerda. También se suelta si el dulce se rompe.

El nivel de estiramiento en el momento del corte (`stretchLevelFor`, umbrales `relaxThresholds`) decide cuál de los cuatro sonidos de corte suena (`cut1`…`cut4`): cuanto más tensa estaba la cuerda, más agudo es el "plas".

## 4. Cuerdas automáticas

Ganchos (`AutoAnchor`) que crean su cuerda solos cuando el dulce pasa a menos de `AUTO_ROPE_T.grabPadding` del gancho. Se usan una sola vez: al dispararse suenan `rope_get` y el círculo punteado azul (`circleColor`) se desvanece (`fadeRatePerSecond`).

## 5. Burbujas

Al tocar el dulce, la burbuja lo atrapa y lo hace subir: cada paso se aplica un impulso (`TUNING.bubbleImpulseY = −40`) más una amortiguación de la velocidad (`bubbleImpulseDamping = 14`), de modo que el dulce asciende frenado en vez de dispararse. Un clic dentro de la burbuja la revienta y el dulce vuelve a caer. Si nadie la revienta, el dulce sale por arriba y pierdes.

## 6. Estrellas

Se recogen cuando el dulce las toca (caja de recolección `STAR_BOX` alrededor de cada una, no solo el radio circular). Se comprueban **antes** que los choques de Matter, así que una estrella tocada en el mismo instante en que Om Nom come también cuenta. El sonido sube de tono según cuántas se llevan (`star_1` → `star_3`). La del nivel 24 se mueve.

## 7. Púas

Aparecen desde el nivel 16 en cuatro tamaños (`SPIKES_T.quadWidths`). Al tocarlas, el dulce se rompe en cinco trozos (`breakPieces`) con velocidad, ángulo y rotación variables; se sueltan las cuerdas, se revienta la burbuja si había una, y pierdes (`breakLoseDelay` después). Las del nivel 22 se mueven.

## 8. Movimiento

Varios tipos de objeto se pueden mover: estrellas, púas y el dedo de los tutoriales comparten el patrón `Mover` ([`src/entities/mover.js`](../src/entities/mover.js)). En el dato del nivel se define:

- `path`: lista de desplazamientos respecto a la posición base; el objeto recorre los puntos en orden y vuelve.
- `moveSpeed`: velocidad base del recorrido (las púas la escalan con `moverSpeedScale`).

El recorrido es de ida y vuelta en ciclos; cada frame el `update` del objeto avanza su posición por el path.

## 9. Tabla de constantes

Las constantes citadas viven en [`src/data/config.js`](../src/data/config.js):

| Grupo | Constantes principales |
|---|---|
| `TUNING` | `gravityY`, `stepSeconds`, `ropePhysicsSpeed`, `bubbleImpulseY`, `bubbleImpulseDamping`, márgenes de derrota |
| `ROPE_T` | `restSegmentLength`, `partWeight`, `cutPartWeight`, `relaxationTimes`, `cutTime`, `cutFadeTime`, `relaxThresholds`, colores |
| `AUTO_ROPE_T` | `grabPadding`, `fadeRatePerSecond`, `circleColor` |
| `SPIKES_T` | `quadWidths`, `moverSpeedScale`, trozos del dulce roto |
| `CANDY_RADIUS`, `OMNOM_RADIUS`, `STAR_RADIUS`, `BUBBLE_RADIUS` | radios de los sensores de Matter |
| `CANDY_STAR_BOX`, `STAR_BOX` | cajas de recolección de estrellas |
