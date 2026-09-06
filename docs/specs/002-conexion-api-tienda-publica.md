# 002 — Conexión de la tienda pública a la API

- **Estado:** Borrador
- **Fecha:** 2026-09-06
- **Módulos de la API:** products, categories (solo lectura)

## 1. Objetivo

El visitante ve el catálogo real de la tienda en vez de los productos de muestra: las
categorías y las novedades del landing salen de la base, el catálogo busca, filtra, ordena y
pagina contra la API, y la ficha de un producto que no existe avisa en vez de mostrar otro.
Cada pantalla dice si está cargando, si falló o si no hay resultados.

## 2. Alcance

### Entra

> **La capa de datos base ya está.** `src/lib/apiClient.js`, `ApiError.js`, `tokenStore.js`,
> el `QueryClient` (creado en `src/main.jsx`) y los providers de `main.jsx` los construyó el
> **spec 003** (sus tareas T1–T5, T8), que se ejecutó antes. Este spec los consume tal cual
> están. El cliente de queries se obtiene con `useQueryClient()`, no importando un módulo.

- `features/categories/api/` + `queries/`: listar categorías.
- `features/products/api/` + `queries/`: listar productos y traer uno por id.
- **Home:** categorías reales y novedades reales (`ordering=-created_at`); el destacado del
  hero es el primer producto de esa lista.
- **Catálogo:** lista paginada real + categorías reales. Se activan los controles que en 001
  quedaron sin handler, y **solo** con los parámetros que acepta `GET /products/`:
  `search`, `category`, `price_min`, `price_max`, `in_stock`, `ordering`, `page`.
- **Estado de los filtros en la URL** (`useSearchParams` de react-router): compartir el link
  reproduce la búsqueda y el botón "atrás" funciona.
- **Ficha de producto:** `GET /products/{id}/` por el `id` de la ruta; 404 muestra un aviso
  con salida al catálogo. Los relacionados salen de una segunda consulta filtrada por la
  categoría del producto.
- Estados de **carga**, **error** (con "Reintentar") y **vacío** en las tres pantallas.
- La lupa del Header lleva a `/catalogo`, donde vive el buscador real.

### No entra

- **Login / registro.** El feature `auth` completo (páginas, formularios, refresh de token) es
  el spec **003**, ya ejecutado. Acá no se toca nada de `features/auth/`: el `apiClient` manda
  `Authorization` **solo si ya hay un token guardado**, así que la tienda lee igual con sesión
  y sin ella.
- **Escrituras de cualquier tipo:** nada de POST/PUT/PATCH/DELETE, ningún `use*Mutations`.
  Esta feature es de solo lectura, así que no hay invalidación de cache que escribir.
- **Buscador con input en el Header.** El campo de búsqueda ya existe en `FilterSidebar`; la
  lupa navega ahí. Se agrega un input propio el día que haya búsqueda global.
- **Debounce de la búsqueda.** El campo aplica al salir del foco o con Enter: cero requests
  por tecla y cero hooks nuevos.
- **Filtrar por más de una categoría a la vez.** La API acepta un solo `?category=`.
- **Skeletons de carga.** El estado de carga reusa `EmptyState`. Si el parpadeo molesta, se
  agrega después.
- **`@tanstack/react-query-devtools`.** Está instalado; se monta cuando alguien necesite
  inspeccionar el cache (una línea en `main.jsx`).
- **Wishlist, carrito, imágenes reales** (la API sigue teniendo una sola `image_url` y la
  galería sigue siendo placeholder), y el resto de cosméticos de la sección 9 del spec 001
  (`formatPrice` con `Intl currency`, `theme-color`, `variant` de `Badge`, color del punto de
  `ProductMeta`, `<fieldset>`/skip-link).

## 3. Contrato de la API

Base: `VITE_API_URL` = `http://localhost:8000/api/v1`. El yaml no declara `servers:` y sus
paths ya incluyen `/api/v1`, así que el `apiClient` concatena base + `/products/` sin repetir
el prefijo.

| Método | Endpoint | Params / Body | Respuesta |
|---|---|---|---|
| GET | `/categories/` | `is_active`, `name`, `search`, `ordering`, `page` | `PaginatedCategoryList` (`{count, next, previous, results: Category[]}`) |
| GET | `/products/` | `category` (number), `in_stock` (bool), `is_active` (bool), `price_min` (number), `price_max` (number), `search`, `ordering`, `page` | `PaginatedProductReadList` (`{count, next, previous, results: ProductRead[]}`) |
| GET | `/products/{id}/` | `id` en el path (integer) | `ProductRead` |

Campos que consume la UI (ya validados en el spec 001): `ProductRead` = `id`, `name`,
`description`, `price`, `stock`, `is_active`, `image_url`, `category` (`CategorySlim`),
`created_at`, `updated_at`. `Category` = `id`, `name`, `slug`, `description`, `is_active`.

Trampas del contrato que pegan acá:

- **`price` es string** (`"1299.00"`). Los filtros `price_min`/`price_max` son `number` en el
  yaml: viajan como texto en la query string y no se hace aritmética con ellos.
- **`category` de un producto es objeto** (`{id, name, slug}`), pero el filtro `?category=`
  es el **id**. Los relacionados usan `product.category.id`.
- **No hay `page_size`.** El tamaño de página lo fija el backend y no se puede pedir "solo 6".
  El landing pide la página 1 y recorta en el cliente (6 categorías, 6 novedades).
- **La paginación no expone el número de páginas**, solo `count`, `next` y `previous`. Los
  botones de la paginación se habilitan con `next`/`previous`; el pill muestra la página
  actual, no el total.
- **`is_active`** existe como filtro en las dos listas: la tienda pública pide siempre
  `is_active=true`. Los booleanos se serializan como `true`/`false`.
- **`ordering`** acepta los cuatro valores que ya lista `ResultsToolbar`: `-created_at`,
  `price`, `-price`, `name`.
- **Todas las operaciones declaran `security: jwtAuth`** aunque su `description` diga
  "public read, staff write". El usuario confirmó que **la lectura es pública**: la tienda
  consulta sin token y el `apiClient` solo adjunta `Authorization` si hay sesión abierta.
- **Sin `/products/` filtrado por slug de categoría:** los chips y el sidebar mandan id.

## 4. Archivos afectados

Todas las rutas ya están previstas en la estructura de `SETUP.md` (`lib/`, `app/`,
`features/*/api/`, `features/*/queries/`). **No hace falta ninguna carpeta nueva y `SETUP.md`
no se modifica.**

`src/lib/ApiError.js`, `src/lib/tokenStore.js`, `src/lib/apiClient.js` y `src/main.jsx` (que crea
el `QueryClient`) **no aparecen en esta tabla**: los provee el spec 003, ya ejecutado.

| Ruta | Acción | Responsabilidad |
|---|---|---|
| `src/features/categories/api/categoriesApi.js` | crear | `listCategories(params)` → `GET /categories/` |
| `src/features/categories/queries/categoryKeys.js` | crear | Factory `all` / `lists()` / `list(filters)` / `details()` / `detail(id)` |
| `src/features/categories/queries/useCategories.js` | crear | `useCategories(filters)` sobre `listCategories` |
| `src/features/products/api/productsApi.js` | crear | `listProducts(params)` → `GET /products/`; `getProduct(id)` → `GET /products/{id}/` |
| `src/features/products/queries/productKeys.js` | crear | Misma factory para productos |
| `src/features/products/queries/useProducts.js` | crear | `useProducts(filters)` con `placeholderData: keepPreviousData` (la grilla no parpadea al pasar de página) |
| `src/features/products/queries/useProduct.js` | crear | `useProduct(id)` sobre `getProduct` |
| `src/features/products/pages/HomePage.jsx` | editar | Borrar los arrays de muestra; consumir `useCategories` y `useProducts`; estados de carga/error |
| `src/features/products/pages/CatalogPage.jsx` | editar | Borrar los arrays de muestra; leer los filtros de `useSearchParams`, consumir las dos queries, cablear sidebar/chips/toolbar/paginación y los estados de carga/error/vacío |
| `src/features/products/pages/ProductDetailPage.jsx` | editar | Borrar el array de muestra; `useProduct(id)` + estados de carga/404/error; relacionados con `useProducts` |
| `src/features/products/components/FilterSidebar.jsx` | editar | Pasa a `<form>`: valores iniciales desde los filtros vigentes, `onApply(filtros)` y `onClear()` |
| `src/features/products/components/ResultsToolbar.jsx` | editar | El `<select>` recibe `ordering` y `onOrderingChange`; propaga `onRemoveFilter` a `ActiveFilters` |
| `src/features/products/components/ActiveFilters.jsx` | editar | La "x" pasa a `<button>` con `onRemove(filter)` |
| `src/features/categories/components/CategoryChips.jsx` | editar | Props `activeId` y `onSelect(id)`; el chip activo sale del filtro vigente, no de un valor fijo |
| `src/components/layout/Header.jsx` | editar | La lupa deja de ser un `<button>` muerto: es un `<Link to="/catalogo">` con `aria-label="Buscar en el catálogo"` |

## 5. Tareas

- [x] **T1–T5 — Capa de datos base: las provee el spec 003.** `ApiError.js`, `tokenStore.js`,
  `apiClient.js` (con el refresh deduplicado completo), el `QueryClient` (creado en `main.jsx`)
  y los providers de `main.jsx` ya existen en el repo. No hay nada que crear acá: la numeración
  arranca en T6
  para no mover las referencias del resto del documento.

- [ ] **T6 — API de categorías**
  - Archivo: `src/features/categories/api/categoriesApi.js`
  - Qué hace: `listCategories(params)` llama a `apiClient('/categories/', { params })`.
    Función async pura, sin React.
  - Hecho cuando: llamada suelta con `{ is_active: true }` devuelve el objeto paginado.

- [ ] **T7 — Query keys de categorías**
  - Archivo: `src/features/categories/queries/categoryKeys.js`
  - Qué hace: la factory de `SETUP.md` §7.
  - Hecho cuando: `categoryKeys.list({is_active:true})` devuelve
    `['categories','list',{is_active:true}]`.

- [ ] **T8 — Hook de categorías**
  - Archivo: `src/features/categories/queries/useCategories.js`
  - Qué hace: `useCategories(filters)` con `queryKey: categoryKeys.list(filters)` y
    `queryFn` que llama a `listCategories`.
  - Hecho cuando: montado en una página devuelve `data.results` con las categorías del
    backend y una sola request en la pestaña Red.

- [ ] **T9 — API de productos**
  - Archivo: `src/features/products/api/productsApi.js`
  - Qué hace: `listProducts(params)` sobre `/products/` y `getProduct(id)` sobre
    `/products/{id}/`.
  - Hecho cuando: ambas funciones devuelven el JSON del backend y propagan el `ApiError`.

- [ ] **T10 — Query keys de productos**
  - Archivo: `src/features/products/queries/productKeys.js`
  - Qué hace: misma factory que T7 con raíz `['products']`.
  - Hecho cuando: `productKeys.detail(7)` devuelve `['products','detail',7]`.

- [ ] **T11 — Hook de lista de productos**
  - Archivo: `src/features/products/queries/useProducts.js`
  - Qué hace: `useProducts(filters, options)` con `placeholderData: keepPreviousData` y
    reenvío de `enabled` (lo necesitan los relacionados de la ficha).
  - Hecho cuando: al pasar de página la grilla anterior queda visible hasta que llega la
    nueva, sin salto a estado de carga.

- [ ] **T12 — Hook de detalle de producto**
  - Archivo: `src/features/products/queries/useProduct.js`
  - Qué hace: `useProduct(id)` con `queryKey: productKeys.detail(id)`, `enabled` solo si hay
    `id`.
  - Hecho cuando: `/productos/1` dispara exactamente una request a `/products/1/`.

- [ ] **T13 — Home conectada**
  - Archivo: `src/features/products/pages/HomePage.jsx`
  - Qué hace: elimina los dos arrays de muestra. Categorías con
    `useCategories({ is_active: true, ordering: 'name' })` recortadas a 6; novedades con
    `useProducts({ is_active: true, ordering: '-created_at' })` recortadas a 6; el destacado
    del `Hero` es el primer resultado. Mientras carga, `Hero` y la grilla muestran
    `EmptyState` con "Cargando…"; ante error, `EmptyState` con "Reintentar" que llama a
    `refetch`.
  - Hecho cuando: con el backend arriba, `/` muestra categorías y productos reales y ningún
    literal de muestra queda en el archivo.

- [ ] **T14 — Catálogo: filtros en la URL**
  - Archivo: `src/features/products/pages/CatalogPage.jsx`
  - Qué hace: lee `search`, `category`, `price_min`, `price_max`, `in_stock`, `ordering`,
    `page` de `useSearchParams` y arma con ellos el objeto de filtros que va a `useProducts`
    (más `is_active: true`). Expone una función local que escribe esos parámetros en la URL y
    resetea `page` cuando cambia cualquier otro filtro.
  - Hecho cuando: entrar a `/catalogo?search=mouse&ordering=price` dispara una sola request
    con esos query params y recargar la página conserva el resultado.

- [ ] **T15 — Catálogo: grilla, contador y estados**
  - Archivo: `src/features/products/pages/CatalogPage.jsx`
  - Qué hace: `ProductGrid` con `data.results`, `ResultsToolbar total={data.count}`, y los
    tres estados: cargando, error con "Reintentar", y `EmptyState` "Ningún producto coincide"
    con acción "Limpiar filtros" cuando `count === 0`. Se borra la constante `SHOW_EMPTY`.
  - Hecho cuando: una búsqueda sin resultados muestra el `EmptyState` real y el botón vacía
    los filtros de la URL.

- [ ] **T16 — Catálogo: categorías reales en el sidebar y en los chips**
  - Archivo: `src/features/products/pages/CatalogPage.jsx`
  - Qué hace: `useCategories({ is_active: true, ordering: 'name' })` alimenta
    `FilterSidebar` y `CategoryChips`; mientras carga, ambos reciben lista vacía.
  - Hecho cuando: las categorías del sidebar coinciden con las del backend y ningún array de
    muestra queda en el archivo.

- [ ] **T17 — FilterSidebar aplicable**
  - Archivo: `src/features/products/components/FilterSidebar.jsx`
  - Qué hace: el `<aside>` pasa a contener un `<form>`; cada control toma su valor inicial de
    los filtros vigentes; radios y switch aplican en su `onChange`; búsqueda y precios aplican
    al `submit` (Enter) y al `blur`. "Limpiar" llama a `onClear()`.
  - Hecho cuando: tildar "Solo con stock" cambia la URL a `?in_stock=true` y la grilla se
    actualiza sin recargar; escribir en la búsqueda no dispara requests hasta salir del campo
    o apretar Enter.

- [ ] **T18 — Chips de categoría con selección real**
  - Archivo: `src/features/categories/components/CategoryChips.jsx`
  - Qué hace: props `activeId` y `onSelect(id)`; "Todo" es `onSelect(null)`; el resaltado sale
    de `activeId`, no de una constante.
  - Hecho cuando: en móvil, tocar un chip pone `?category=<id>` en la URL y lo deja marcado.

- [ ] **T19 — Chips de filtros activos removibles**
  - Archivo: `src/features/products/components/ActiveFilters.jsx` y `ResultsToolbar.jsx`
  - Qué hace: `ActiveFilters` recibe `filters: [{ key, label }]` y `onRemove(key)`; la "x"
    pasa a `<button>` con `aria-label`. `ResultsToolbar` solo los propaga. La lista de chips
    la arma `CatalogPage` a partir de la URL (el nombre de la categoría sale de la query de
    categorías).
  - Hecho cuando: con dos filtros puestos aparecen dos chips y hacer clic en la "x" de uno
    quita solo ese parámetro de la URL.

- [ ] **T20 — Orden conectado**
  - Archivo: `src/features/products/components/ResultsToolbar.jsx`
  - Qué hace: el `<select>` pasa a controlado (`value={ordering}` + `onOrderingChange`), con
    las mismas cuatro opciones.
  - Hecho cuando: elegir "Precio: de menor a mayor" pone `?ordering=price` y la grilla llega
    ordenada desde el backend.

- [ ] **T21 — Paginación conectada**
  - Archivo: `src/features/products/pages/CatalogPage.jsx`
  - Qué hace: las flechas pasan a `<button>` que suman/restan `page` en la URL; se
    deshabilitan según `previous` / `next` de la respuesta; el pill muestra la página actual y
    el texto de la izquierda, `{count} resultados`.
  - Hecho cuando: en la última página la flecha derecha está deshabilitada
    (`disabled` + `aria-disabled`) y "atrás" del navegador vuelve a la página anterior.

- [ ] **T22 — Ficha de producto conectada**
  - Archivo: `src/features/products/pages/ProductDetailPage.jsx`
  - Qué hace: `useProduct(id)` reemplaza al array de muestra. Cargando → `EmptyState`
    "Cargando…"; `error.status === 404` → `EmptyState` "No encontramos ese producto" con
    `Button` a `/catalogo`; otro error → "Reintentar".
  - Hecho cuando: `/productos/999999` muestra el aviso de no encontrado (no el primer
    producto) y `/productos/1` muestra el producto real con su breadcrumb.

- [ ] **T23 — Relacionados de la ficha**
  - Archivo: `src/features/products/pages/ProductDetailPage.jsx`
  - Qué hace: `useProducts({ category: product.category.id, is_active: true }, { enabled })`
    con `enabled` atado a que el producto ya esté cargado; se excluye el producto actual y se
    recortan 3. Si no queda ninguno, la sección no se renderiza.
  - Hecho cuando: la sección "Más de <categoría>" muestra productos de esa categoría y nunca
    el que se está viendo.

- [ ] **T24 — Lupa del Header**
  - Archivo: `src/components/layout/Header.jsx`
  - Qué hace: el `<button>` sin handler pasa a `<Link to="/catalogo">` con
    `aria-label="Buscar en el catálogo"` y el mismo estilo/anillo de foco.
  - Hecho cuando: hacer clic en la lupa desde `/` navega al catálogo.

## 6. Criterios de aceptación

- [ ] `npm run build` pasa sin errores.
- [ ] `npm run lint` pasa sin errores nuevos.
- [ ] No queda ningún array de datos de muestra ni comentario `TODO(002)` en
      `HomePage.jsx`, `CatalogPage.jsx` ni `ProductDetailPage.jsx`.
- [ ] Ningún componente ni página importa `fetch`, `apiClient` o `features/*/api/`
      directamente: el camino es página/componente → `queries/` → `api/` → `apiClient`.
- [ ] Ningún `useEffect` trae datos del servidor.
- [ ] Las tres pantallas cubren carga, error (con "Reintentar" que vuelve a pedir) y vacío.
- [ ] La grilla del catálogo cambia al mover cualquier filtro, el orden o la página, sin
      recargar la página; la URL refleja siempre el estado y es compartible.
- [ ] Todos los query params enviados existen en `docs/ecommerce-api.yaml` para ese endpoint:
      `search`, `category`, `price_min`, `price_max`, `in_stock`, `is_active`, `ordering`,
      `page`. No se manda ningún parámetro vacío.
- [ ] `/productos/<id-inexistente>` muestra el aviso de no encontrado, no otro producto.
- [ ] Un 4xx no se reintenta (se ve una sola request en la pestaña Red).
- [ ] Cambiar de página no vacía la grilla: se mantiene la anterior hasta que llega la nueva.
- [ ] Los precios se siguen mostrando con `formatPrice` a partir del `price` string; no hay
      aritmética con `price`.
- [ ] `SETUP.md` no fue modificado y no se creó ninguna carpeta fuera de su estructura.
- [ ] No se agregaron dependencias a `package.json`.

## 7. Preguntas abiertas

1. ~~**¿`GET /products/` y `GET /categories/` son públicos?**~~ **CERRADA.** Confirmado por
   el usuario: **la lectura es anónima**. El yaml los marca `security: jwtAuth`, pero manda la
   `description` de ambos viewsets (*"public read, staff write"*) y la confirmación. El
   `apiClient` adjunta `Authorization` **solo si ya hay un token guardado**, así que la tienda
   funciona igual con sesión y sin ella.
2. ~~**Refresh de token.**~~ **CERRADA.** Auth se hace primero: el flujo completo de
   `SETUP.md` §7 (401 → un refresh deduplicado → reintento → `clear` + salida a `/login`) lo
   construye el **spec 003**, tareas T4–T5. Cuando se ejecute este spec, el `apiClient` ya lo
   tiene.
3. **Cuántos ítems muestra el landing.** La API no expone `page_size`. **Default:** se pide la
   página 1 y se recortan 6 categorías y 6 productos en el cliente (lo mismo que mostraba la
   maqueta).
4. **Texto de la paginación.** La maqueta dice "1-9 de 9", pero el tamaño de página no viene
   en la respuesta y calcularlo a partir de `results.length` miente en la última página.
   **Default:** a la izquierda "{count} resultados", en el pill la página actual, y las
   flechas habilitadas por `next` / `previous`.
5. **Productos ocultos.** **Default:** la tienda pública manda siempre `is_active=true`, así
   que `ProductMeta` mostrará siempre "Publicado". Si querés que la ficha muestre también
   productos ocultos a quien llegue por link directo, decilo (el detalle no tiene filtro:
   `GET /products/{id}/` devuelve el producto sea cual sea su `is_active`).
