# Diseño — fuentes del canvas

Maquetas de referencia de la tienda. **No son código de la app**: no se importan
desde `src/`, no se compilan y no entran al bundle. Son la referencia visual que el
`developer` traduce a componentes React.

Canvas publicado: https://claude.ai/code/artifact/4dec6979-64df-4be7-b0dd-12587ccc4325

## Archivos

| Archivo | Pantalla |
|---|---|
| `Main.dc.html` | Landing: hero, categorías, novedades |
| `Catalogo.dc.html` | Catálogo: sidebar de filtros + grilla de resultados |
| `Producto.dc.html` | Detalle de producto |
| `Movil.dc.html` | Landing en 390 px |
| `canvas.json` | Posición de los artboards en el canvas |

Cada `.dc.html` es un artboard independiente. No comparten estado entre sí: lo que
se toca en uno no mueve a los demás.

## Decisiones que vienen del contrato

El diseño no inventa campos. Contra `docs/ecommerce-api.yaml`:

- **Sin estrellas, reseñas ni marca.** No existen en `ProductRead`.
- **Sin descuentos ni precios tachados.** No hay campo de precio anterior.
- **Filtro de categoría de a una**, no multiselección: `?category=` es un número.
- **Una sola imagen por producto** (`image_url`). Las miniaturas del detalle son
  espacio previsto, no dato existente.
- El badge amarillo sale de `stock <= 5`; `stock === 0` apaga la card.
- Precios formateados como `S/ 1,299.00` a partir del `price` string.

Los filtros del sidebar son exactamente los que acepta la API: `search`, `category`,
`price_min`, `price_max`, `in_stock`, `ordering`, `page`.

## Pendientes marcados en la maqueta

Todo lo que está entre corchetes es un dato que falta, no texto final:
`[MARCA]`, la bajada del hero, el contacto del pie y el destino del botón
"Consultar disponibilidad" (no hay carrito ni checkout en la API).

## Cómo se edita

Se edita visualmente en el canvas publicado y se guarda desde ahí, o se editan estos
archivos y se vuelve a armar el canvas con la skill `design` de Claude Code. El
`.html` armado (~2.5 MB, trae el editor adentro) es salida regenerable y no se versiona.
