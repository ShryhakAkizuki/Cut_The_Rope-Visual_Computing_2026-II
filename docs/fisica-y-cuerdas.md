# Física y mecánicas

Cómo se mueve y se detecta cada cosa. Los valores se ajustan con los de la version de Cut The Rope DX y están en [`config.js`](../src/data/config.js).

## 1. Modelo

- **Matter:** Detecata los cuerpos que no son sólidos ni sienten gravedad: solo siguen a los objetos para avisar cuando se tocan.
- **Verlet:** una cuerda se estira, se balancea y, al cortarla, cada trozo sigue cayendo. Con los cuerpos rígidos de Matter eso solo se podía imitar. Asi es como lo hace Cut The Rope DX para que la sensación se igual a la del juego
- **P5:** La simulación avanza en frames de 1/60 s. Las cuerdas y el dulce van un poco más rápido (×1,4).

## 2. Objetos

Cada punto de un objeto recuerda dónde estaba y dónde está ahora; la diferencia es su velocidad. Puede quedar fijo (como el gancho) y estar unido a otros por restricciones de distancia: si dos puntos se alejan o se acercan de más, cada uno se corrige un poco, y más el más liviano.

## 3. Cuerdas

Una cuerda es una fila de puntos livianos entre el gancho y el dulce, que es mucho más pesado y comparte todas sus cuerdas.

- Nace con un poco tamaño variable para que empieze floja o justa.
- No tiene un valor de elasticidad: se estira porque los puntos se corrigen entre sí, y eso da el balanceo.
- Se dibuja como una curva suave con franjas de dos colores, y se pone roja cuando está muy estirada. Cuánto estaba estirada al cortarla decide cuál de los cuatro sonidos suena.

### Corte

1. Al arrastrar, se prueba cada cuerda en orden y se corta la primera que se toque (como mucho una por frame).
2. La cuerda queda un instante en blanco.
3. Luego se parte en dos trozos casi sin peso, así que no tiran del dulce, y siguen cayendo mientras se desvanecen.
4. Al desaparecer, la cuerda suelta el dulce. También lo suelta si el dulce se rompe.

## 4. Cuerdas automáticas

Ganchos que crean su cuerda solos cuando el dulce pasa lo bastante cerca. Se usan una sola vez y el círculo punteado se desvanece después.

## 5. Burbujas

Al tocar el dulce, la burbuja lo atrapa y lo hace subir frenándolo. Un clic dentro la revienta y el dulce vuelve a caer. Si nadie la revienta, el dulce sale por arriba y pierdes.

## 6. Estrellas

Se recogen cuando el dulce las toca. Se comprueban antes de los choques, así que una estrella tocada en el mismo instante en que Om Nom come también cuenta. La del nivel 24 se mueve.

## 7. Púas

Aparecen desde el nivel 16 en cuatro tamaños. Al tocarlas, el dulce se rompe en cinco trozos, se sueltan las cuerdas, se revienta la burbuja si había una y pierdes. Las del nivel 22 se mueven.

## 8. Movimiento

Varios tipos de objetos se pueden mover, cada uno recorre un camino definido en el nivel, van y vuelven en ciclos.
