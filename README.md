# Cut_The_Rope-Visual_Computing_2026-II

Recreación de *Cut the Rope* en el navegador, con el objetivo de llevar los 25 niveles de la primera caja (Cardboard Box). Proyecto del curso Visual Computing 2026-II.

**Jugar:** https://shryhakakizuki.github.io/Cut_The_Rope-Visual_Computing_2026-II/

## Integrantes

-
-
-
-

## Cómo jugar

- Arrastra el ratón sobre una cuerda para cortarla.
- Haz clic en una burbuja para reventarla.
- `P` pausa, `R` reinicia el nivel.

Lleva el dulce hasta Om Nom y recoge las estrellas por el camino.

## Correr en local

No hay nada que instalar; basta con servir la carpeta `src/`:

```bash
python3 -m http.server 8000 -d src
```

y abrir http://localhost:8000.

## Tecnologías

JavaScript sin bundler, [p5.js](https://p5js.org/) para el dibujo y la entrada, y [Matter.js](https://brm.io/matter-js/) para la física.

## Documentación

- [Plan de la Caja 1](docs/plan-caja1.md): estado actual, fases y tareas pendientes.
- [Referencia del DX](docs/referencia-dx.md): qué se reutiliza de Cut the Rope DX (constantes, lógica, imágenes, sonido).
- [Arquitectura MVP](docs/arquitectura-mvp.md): componentes y diagramas (estados, game loop, clases, corte de cuerda).

## Créditos

Los niveles, las imágenes y el comportamiento de referencia vienen del proyecto de fans [Cut the Rope DX](https://github.com/yell0wsuit/cuttherope-dx) (decompilación no afiliada; assets en [ctrdx-assets](https://github.com/yell0wsuit/ctrdx-assets)). *Cut the Rope*, sus personajes y sus assets son propiedad de ZeptoLab. Este es un proyecto académico sin fines comerciales.

El código propio se distribuye bajo la licencia [AGPL-3.0](LICENSE).
