# 001 — Scaffold de la tienda pública (solo UI)

- **Estado:** Implementado
- **Fecha:** 2026-09-05
- **Módulos de la API:** products, categories (solo forma de lectura; **no se hace ninguna llamada**)

## 1. Objetivo

El visitante puede recorrer visualmente la tienda: un landing con hero, categorías y
novedades; un catálogo con sidebar de filtros y grilla de resultados; y una ficha de
producto con galería, datos y un botón de contacto. Todo con datos de muestra: se ve y se
navega entre las 3 rutas, pero todavía no consume la API. Deja la estructura de carpetas y
los componentes "cascarón" listos para que el spec siguiente les enchufe TanStack Query.

## 2. Alcance

### Entra

- Tokens de tema (colores y fuentes de las maquetas) en `src/index.css` con `@theme`.
- Helpers de presentación `formatPrice` y `formatDate` en `src/utils/`.
- Primitivas de UI compartidas: `Button`, `Badge`, `Breadcrumbs`, `IconButton`, `EmptyState`.
- Layout de tienda: `StoreLayout`, `Header`, `AccountMenu`, `Footer`, `BottomNav`.
- Componentes de `features/categories/`: `CategoryCard`, `CategoryGrid`, `CategoryChips`.
- Componentes de `features/products/`: `ProductCard`, `ProductGrid`, `FeaturedProduct`,
  `Hero`, `FilterSidebar`, `ActiveFilters`, `ResultsToolbar`, `ProductGallery`,
  `ProductInfo`, `ProductMeta`, `ProductActions`.
- Páginas: `HomePage` (`/`), `CatalogPage` (`/catalogo`), `ProductDetailPage`
  (`/productos/:id`).
- Router con las 3 rutas públicas envueltas por `StoreLayout`, montado desde `main.jsx`.
- Datos de muestra **hardcodeados dentro de cada página** (arrays literales con un
  comentario `// TODO(002): reemplazar por datos de la API`), pasados hacia abajo por props.
- Responsive: las 3 pantallas colapsan a una columna en móvil como en `Movil.dc.html`
  (header con hamburguesa, chips de categoría, grilla de 1 columna, `BottomNav` visible solo
  en móvil).

### No entra

- **Toda la capa de datos:** `src/lib/apiClient.js`, `src/lib/ApiError.js`,
  `src/lib/tokenStore.js`, `src/app/queryClient.js`, y cualquier `features/*/api/`,
  `features/*/queries/`, `*Keys.js`. No se instala ni se configura TanStack Query todavía.
- **Feature `auth` completo:** no se crean `LoginPage`, `RegisterPage`, `LoginForm`,
  `RegisterForm` ni `features/auth/`. `AccountMenu` linkea a `/login` y `/registro` con
  `<Link>`, pero esas rutas no existen en este spec (quedan 404 hasta el spec de auth).
- **CRUD de administración:** `CategoryTable`, `CategoryForm`, `ProductForm`,
  `CategoryListPage`, etc. que menciona `SETUP.md`. Este spec es solo la tienda pública.
- **Wishlist / favoritos:** el corazón es markup estático (`IconButton` decorativo, sin
  `onClick`, sin estado) en `ProductCard`, `ProductGallery` y `ProductActions`.
- **Filtrado real:** `FilterSidebar`, `ActiveFilters`, `ResultsToolbar`, la paginación y las
  `CategoryChips` son markup. No filtran, no ordenan, no paginan y no tocan la URL.
- **Navegación del hero / anclas del landing** a secciones concretas más allá de lo que ya
  resuelve un `<a href="#...">` o un `<Link>` a `/catalogo`.
- `ProtectedRoute` / rutas privadas.
- Tests, Storybook, `@tailwindcss/vite` reconfig (ya está puesto).
- Imágenes reales: la caja de imagen es un placeholder con degradado + ícono, igual que la
  maqueta. `image_url` de la muestra puede ir vacío.

## 3. Contrato de la API

Esta feature **no llama a ningún endpoint**. Lo único que toma del contrato es la **forma de
lectura** de los recursos, para que los datos de muestra no inventen campos y el spec 002
pueda sustituirlos sin tocar los componentes.

| Recurso | Esquema de lectura (`docs/ecommerce-api.yaml`) | Campos que usa la UI |
|---|---|---|
| Producto | `ProductRead` | `id`, `name`, `description`, `price`, `stock`, `is_active`, `image_url`, `category` (`CategorySlim`), `created_at`, `updated_at` |
| Categoría | `Category` | `id`, `name`, `slug`, `description`, `is_active` |
| Categoría anidada en producto | `CategorySlim` | `id`, `name`, `slug` |

Trampas del contrato que condicionan el markup:

- **`price` es string** (`"1299.00"`, patrón `^-?\d{0,8}(?:\.\d{0,2})?$`). Nunca hacer
  aritmética: `formatPrice` recibe el string y devuelve `"S/ 1,299.00"`. Los datos de
  muestra guardan `price` como string.
- **Una sola imagen por producto** (`image_url`, o string vacío). Las miniaturas de
  `ProductGallery` son espacio previsto, no dato: se pintan como placeholders fijos.
- **`category` en el producto es un objeto `{ id, name, slug }`**, no un id. `ProductCard`
  y `ProductInfo` leen `product.category.name`.
- **`is_active`** se muestra como estado legible: `true` → "Publicado", `false` →
  "Oculto". Lo consume `ProductMeta`.
- **Badge de stock:** `stock === 0` → card apagada (`opacity`) + etiqueta "Sin stock";
  `1 ≤ stock ≤ 5` → `Badge` amarillo "Últimas N unidades"; `stock > 5` → sin badge, texto
  "N disponibles".
- **`ordering` del `<select>` de `ResultsToolbar`** usa nombres de campo reales de
  `ProductRead`, para que el spec 002 los mande tal cual como `?ordering=`: `-created_at`
  (Más recientes), `price` (menor a mayor), `-price` (mayor a menor), `name` (A-Z).
- **Filtros de `FilterSidebar`** = exactamente los que acepta `GET /products/` según
  `SETUP.md`: `search`, `category` (uno solo, es un id), `price_min`, `price_max`,
  `in_stock`. El texto "La API filtra por una categoría a la vez" queda en el markup.

## 4. Archivos afectados

Todas las rutas caben en la estructura de `SETUP.md` (features por módulo + `components/` +
`utils/` + `app/`). **No hace falta ninguna carpeta nueva y `SETUP.md` no se modifica.**

| Ruta | Acción | Responsabilidad |
|---|---|---|
| `src/index.css` | editar | Agregar `@import` de Google Fonts (Archivo, Space Grotesk) y bloque `@theme` con los tokens de color y fuente de las maquetas |
| `src/utils/formatPrice.js` | crear | `formatPrice(priceString) → "S/ 1,299.00"` (Intl, `es-PE`, 2 decimales) |
| `src/utils/formatDate.js` | crear | `formatDate(isoString) → "5 sep 2026"` (Intl, `es-PE`) |
| `src/utils/stockLabel.js` | crear | `stockLabel(stock) → "Sin stock" / "Últimas N unidades" / "N disponibles"`. Única fuente de los umbrales (0, ≤5) y los tres textos; la usan `ProductCard` y `FeaturedProduct` |
| `src/components/ui/Button.jsx` | crear | Botón/enlace con variantes `acc` (relleno acento) y `ghost` (borde). Acepta `as`/`to` para render como `<Link>` |
| `src/components/ui/Badge.jsx` | crear | Etiqueta chica. Variantes `nuevo` ("Novedad", acento) y `stock` (amarillo, `stock <= 5`) |
| `src/components/ui/Breadcrumbs.jsx` | crear | Recibe `items: [{ label, to? }]`; el último sin enlace |
| `src/components/ui/IconButton.jsx` | crear | Botón redondo de ícono. **Decorativo por defecto** (sin `onClick`); acepta `children` (svg) y `label` para `aria-label` |
| `src/components/ui/EmptyState.jsx` | crear | Título + texto + acción opcional. Usado como "Ningún producto coincide" |
| `src/components/layout/StoreLayout.jsx` | crear | `<Header/>` + `<main><Outlet/></main>` + `<Footer/>` + `<BottomNav/>`. Fondo oscuro base |
| `src/components/layout/Header.jsx` | crear | `[MARCA]`, pill "Catálogo" (`<Link to="/catalogo">`), nav "Novedades"/"Categorías", ícono buscar (decorativo), `<AccountMenu/>`. Colapsa a hamburguesa en móvil |
| `src/components/layout/AccountMenu.jsx` | crear | Dropdown controlado por `useState` local: "Iniciar sesión" (`<Link to="/login">`), "Crear cuenta" (`<Link to="/registro">`), nota "Se entra con el correo" |
| `src/components/layout/Footer.jsx` | crear | `[MARCA]`, "Precios en soles (S/), IGV incluido.", columnas Tienda/Cuenta/Contacto con placeholders `[correo de contacto]`, `[teléfono / WhatsApp]` |
| `src/components/layout/BottomNav.jsx` | crear | Tab bar visible solo `< md`. Tabs: Inicio (`/`), Catálogo (`/catalogo`), Cuenta (`/login`), con `NavLink` para el estado activo. Ver «Preguntas abiertas» |
| `src/features/categories/components/CategoryCard.jsx` | crear | Card de categoría: ícono (por `slug`, mapa decorativo local), `name`, `description`. Render como `<Link to="/catalogo">` |
| `src/features/categories/components/CategoryGrid.jsx` | crear | Sección "Categorías" del landing: encabezado + grilla de `CategoryCard` (3 col desktop / 2 col móvil). Recibe `categories` por props |
| `src/features/categories/components/CategoryChips.jsx` | crear | Fila horizontal de chips (`Todo` + una por categoría). Markup, sin estado de selección real. Recibe `categories` |
| `src/features/products/components/ProductCard.jsx` | crear | Card de grilla usada en las 3 pantallas: caja-placeholder con degradado, `IconButton` corazón decorativo, `Badge` de stock, categoría, nombre, `formatPrice(price)`, texto de stock, botón "Ver detalle" (`<Link to={\`/productos/${id}\`}>`). `stock === 0` → apagada. Recibe `product` |
| `src/features/products/components/ProductGrid.jsx` | crear | Grilla responsive de `ProductCard`. Recibe `products`; si viene vacío, no renderiza el `EmptyState` (eso lo decide la página) |
| `src/features/products/components/FeaturedProduct.jsx` | crear | Card grande del hero con `Badge` "Novedad", caja-placeholder, categoría, nombre, precio, stock. Recibe `product` |
| `src/features/products/components/Hero.jsx` | crear | Bloque marketing del landing (solo-landing, sin datos): kicker "Tienda en línea", `h1` "Todo el catálogo en un solo lugar", bajada placeholder `[Una línea sobre qué vende tu tienda y para quién.]`, `Button` acc "Ver el catálogo" + `Button` ghost "Explorar categorías". Muestra `FeaturedProduct` al lado; recibe `featured` por props |
| `src/features/products/components/FilterSidebar.jsx` | crear | `<aside>` con: título "Filtros" + "Limpiar" (decorativo), búsqueda (`<input type="search">`), lista de categorías tipo radio (recibe `categories`), precio Mín./Máx. (`<input type="number">`), switch "Solo con stock", nota "?category=id". Inputs no controlados, sin handlers |
| `src/features/products/components/ActiveFilters.jsx` | crear | Fila de chips de filtros activos con la "x". Recibe `filters: [{ label }]`; la "x" es decorativa |
| `src/features/products/components/ResultsToolbar.jsx` | crear | "N resultados" + `<ActiveFilters/>` + `<select>` de orden con las 4 opciones del contrato. Recibe `total`; `<select>` sin `onChange` |
| `src/features/products/components/ProductGallery.jsx` | crear | Imagen principal placeholder + `Badge` "Novedad" + `IconButton` corazón decorativo + fila de 4 miniaturas placeholder + nota "La API guarda una sola image_url". Sin estado de selección |
| `src/features/products/components/ProductInfo.jsx` | crear | Categoría, `h1` nombre, `description`, `formatPrice(price)` grande + "IGV incluido". Recibe `product` |
| `src/features/products/components/ProductMeta.jsx` | crear | Tabla de 4 filas: Categoría (`category.name`), Stock ("N unidades"), Estado (`is_active` → "Publicado"/"Oculto" con punto), Actualizado (`formatDate(updated_at)`). Recibe `product` |
| `src/features/products/components/ProductActions.jsx` | crear | `Button` acc "Consultar disponibilidad" (placeholder: sin destino real; comentario en el código) + `IconButton` corazón decorativo al lado. Nota "Todavía no hay carrito ni checkout" |
| `src/features/products/pages/HomePage.jsx` | crear | Ruta `/`. Datos de muestra inline. Compone `Hero` (con `featured`) + `CategoryGrid` + sección "Novedades" con `ProductGrid`. Importa `CategoryGrid` desde `features/categories/components/` (superficie pública), nunca internals |
| `src/features/products/pages/CatalogPage.jsx` | crear | Ruta `/catalogo`. Datos de muestra inline. `Breadcrumbs` + `h1` "Catálogo" + layout `FilterSidebar` \| (`ResultsToolbar` + `ProductGrid`). En móvil, `CategoryChips` en vez del sidebar. Incluye el markup de paginación (estático) y el `EmptyState` renderizado de forma condicional a modo de ejemplo (comentado o tras un flag local) |
| `src/features/products/pages/ProductDetailPage.jsx` | crear | Ruta `/productos/:id`. `useParams()` para leer `id` (solo se muestra / se usa para elegir del array de muestra). `Breadcrumbs` + (`ProductGallery` \| `ProductInfo` + `ProductMeta` + `ProductActions`) + sección "Más de <categoría>" con `ProductGrid` de relacionados de muestra |
| `src/app/router.jsx` | crear | `createBrowserRouter([{ element: <StoreLayout/>, children: [ {index → HomePage}, {path:'catalogo' → CatalogPage}, {path:'productos/:id' → ProductDetailPage} ] }])`. Exporta `router` |
| `src/main.jsx` | editar | Reemplazar `<App/>` por `<RouterProvider router={router}/>` |
| `src/App.jsx` | eliminar | Ya no se usa; su lugar lo toma el router |

Imports de React Router: todo desde el paquete `react-router` (v8, `react-router-dom` quedó
como alias): `createBrowserRouter`, `RouterProvider`, `Outlet`, `Link`, `NavLink`,
`useParams`.

## 5. Tareas

Ordenadas por dependencia. Cada una es verificable por separado.

- [x] **T1 — Tokens de tema y fuentes**
  - Archivo: `src/index.css`
  - Qué hace: agrega el `@import` de Google Fonts (Archivo 400–700, Space Grotesk 500/700)
    antes de `@import "tailwindcss"`, y un bloque `@theme` con los colores de la maqueta
    (fondo `#080808`, superficies `#18181c` / `#101014`, líneas `#23232a` / `#2a2a31`,
    textos `#ffffff` / `#e6e6ea` / `#8e8e97` / `#6f6f78` / `#5c5c65`, acento `#dfe31d`) y
    las familias (`--font-sans` Archivo, `--font-display` Space Grotesk).
  - Hecho cuando: `npm run dev` levanta, el `body` toma fondo oscuro y las clases utilitarias
    del acento (`bg-*`, `text-*` con el token nuevo) resuelven.

- [x] **T2 — Helpers de presentación**
  - Archivo: `src/utils/formatPrice.js`, `src/utils/formatDate.js`, `src/utils/stockLabel.js`
  - Qué hace: `formatPrice("1299.00")` devuelve `"S/ 1,299.00"`; `formatDate` formatea un ISO
    a fecha corta `es-PE`; `stockLabel(stock)` centraliza los umbrales de stock y sus tres
    textos. Funciones puras, sin React.
  - Hecho cuando: importadas en un componente devuelven el string esperado; toleran entrada
    vacía o inválida sin tirar (devuelven `""` o un guion).

- [x] **T3 — Primitivas de UI**
  - Archivo: `src/components/ui/Button.jsx`, `Badge.jsx`, `Breadcrumbs.jsx`,
    `IconButton.jsx`, `EmptyState.jsx`
  - Qué hace: cada una con las props de la tabla de la sección 4. `Button` soporta variantes
    `acc`/`ghost` y render como `<Link>`. `IconButton` es decorativo (sin `onClick`) pero
    lleva `aria-label`.
  - Hecho cuando: se pueden montar sueltas con props de ejemplo y se ven como en la maqueta;
    ninguna tiene estado ni handlers salvo lo mínimo de accesibilidad.

- [x] **T4 — Layout de tienda**
  - Archivo: `src/components/layout/StoreLayout.jsx`, `Header.jsx`, `AccountMenu.jsx`,
    `Footer.jsx`, `BottomNav.jsx`
  - Qué hace: `StoreLayout` arma Header + `<Outlet/>` + Footer + BottomNav. `AccountMenu`
    abre/cierra con `useState` local y linkea a `/login` y `/registro`. `Header` colapsa a
    hamburguesa `< md`; `BottomNav` se oculta `>= md`.
  - Hecho cuando: renderizado dentro de un router de prueba, el layout se ve como las
    maquetas en desktop y como `Movil.dc.html` en 390 px; el dropdown de cuenta abre y
    cierra.

- [x] **T5 — Componentes de categorías**
  - Archivo: `src/features/categories/components/CategoryCard.jsx`, `CategoryGrid.jsx`,
    `CategoryChips.jsx`
  - Qué hace: `CategoryGrid` recibe `categories` y pinta la grilla del landing con
    `CategoryCard` (ícono por `slug` desde un mapa local, `name`, `description`).
    `CategoryChips` pinta la fila de chips (markup, sin selección real).
  - Hecho cuando: con un array de 6 categorías de ejemplo, la grilla y los chips se ven como
    la maqueta; cada card es un `<Link to="/catalogo">`.

- [x] **T6 — Cards de producto compartidas**
  - Archivo: `src/features/products/components/ProductCard.jsx`, `ProductGrid.jsx`
  - Qué hace: `ProductCard` recibe `product` (forma `ProductRead`) y aplica las reglas de
    stock (badge amarillo `<= 5`, apagada en `0`), `formatPrice`, corazón decorativo, y
    "Ver detalle" que enlaza a `/productos/:id`. `ProductGrid` es la grilla responsive.
  - Hecho cuando: con 6 productos de muestra (incluido uno con `stock: 0` y uno con
    `stock: 3`) la grilla reproduce los tres estados visuales de la maqueta.

- [x] **T7 — Hero y producto destacado**
  - Archivo: `src/features/products/components/Hero.jsx`, `FeaturedProduct.jsx`
  - Qué hace: `Hero` con textos fijos + bajada placeholder + botones; recibe `featured` y lo
    pasa a `FeaturedProduct`, que pinta la card grande "Novedad".
  - Hecho cuando: montado con un producto de muestra se ve como el hero de `Main.dc.html`.

- [x] **T8 — Componentes del catálogo**
  - Archivo: `src/features/products/components/FilterSidebar.jsx`, `ActiveFilters.jsx`,
    `ResultsToolbar.jsx`
  - Qué hace: `FilterSidebar` con búsqueda, radios de categoría, precio min/max, switch de
    stock y "Limpiar" — todo markup, inputs no controlados, sin handlers. `ResultsToolbar`
    con "N resultados", `ActiveFilters` y el `<select>` de orden con las 4 opciones del
    contrato.
  - Hecho cuando: se ven como `Catalogo.dc.html`; el `<select>` lista `-created_at`,
    `price`, `-price`, `name`; ningún input dispara lógica.

- [x] **T9 — Componentes de la ficha de producto**
  - Archivo: `src/features/products/components/ProductGallery.jsx`, `ProductInfo.jsx`,
    `ProductMeta.jsx`, `ProductActions.jsx`
  - Qué hace: galería con imagen principal placeholder + 4 miniaturas fijas + corazón
    decorativo; `ProductInfo` con categoría/nombre/descripción/precio + "IGV incluido";
    `ProductMeta` con la tabla de 4 filas (`is_active` → "Publicado"/"Oculto",
    `formatDate(updated_at)`); `ProductActions` con "Consultar disponibilidad" (placeholder
    de destino) + corazón decorativo.
  - Hecho cuando: montados con un producto de muestra reproducen la columna derecha e
    izquierda de `Producto.dc.html`.

- [x] **T10 — Páginas**
  - Archivo: `src/features/products/pages/HomePage.jsx`, `CatalogPage.jsx`,
    `ProductDetailPage.jsx`
  - Qué hace: cada página declara sus datos de muestra en un array literal con el comentario
    `// TODO(002): reemplazar por datos de la API` y los pasa por props a los componentes.
    `HomePage` importa `CategoryGrid` de `features/categories/components/`.
    `ProductDetailPage` usa `useParams()` para elegir el producto de muestra.
  - Hecho cuando: navegando a `/`, `/catalogo` y `/productos/1` las tres pantallas se ven
    completas y fieles a las maquetas correspondientes.

- [x] **T11 — Router**
  - Archivo: `src/app/router.jsx`
  - Qué hace: define `createBrowserRouter` con un route padre `element={<StoreLayout/>}` y
    tres hijos: `index` → `HomePage`, `catalogo` → `CatalogPage`, `productos/:id` →
    `ProductDetailPage`. Exporta `router`.
  - Hecho cuando: importable sin errores; las 3 rutas resuelven a su página dentro del
    layout.

- [x] **T12 — Montaje**
  - Archivo: `src/main.jsx` (editar), `src/App.jsx` (eliminar)
  - Qué hace: `main.jsx` renderiza `<RouterProvider router={router}/>` dentro de
    `<StrictMode>`. Se borra `App.jsx`.
  - Hecho cuando: `npm run dev` abre el landing en `/` y se puede navegar a las otras dos
    rutas con los `<Link>` del Header y de las cards.

## 6. Criterios de aceptación

- [x] `npm run build` pasa sin errores.
- [x] `npm run lint` (oxlint) pasa sin errores nuevos.
- [x] Las 3 rutas (`/`, `/catalogo`, `/productos/:id`) renderizan dentro de `StoreLayout`
      (header y footer presentes en las tres).
- [ ] Cada pantalla es fiel a su maqueta en desktop (1280–1360 px) y colapsa a una columna
      en ~390 px como `Movil.dc.html`; `BottomNav` solo aparece `< md`.
- [x] `ProductCard` muestra los tres estados de stock: badge amarillo con `stock <= 5`, card
      apagada con `stock === 0`, texto "N disponibles" con `stock > 5`.
- [x] Los precios se muestran como `S/ 1,299.00`, generados por `formatPrice` a partir del
      `price` string (no hay literales `S/ ...` hardcodeados en los componentes).
- [x] Ningún dato de muestra usa campos que no estén en `ProductRead` / `Category` /
      `CategorySlim` (sin rating, marca, descuento ni variantes).
- [x] No existe ningún archivo bajo `src/lib/`, `src/app/queryClient.js`,
      `features/*/api/` ni `features/*/queries/`. Ningún componente importa
      `@tanstack/react-query` ni llama a `fetch`.
- [x] El wishlist es markup: no hay `onClick` ni `useState` de favoritos en `ProductCard`,
      `ProductGallery` ni `ProductActions`.
- [x] `FilterSidebar`, `ActiveFilters`, `ResultsToolbar`, la paginación y `CategoryChips` no
      filtran ni ordenan nada: cambiar un input no altera la grilla.
- [x] `AccountMenu` abre/cierra y sus enlaces apuntan a `/login` y `/registro` (que dan 404,
      es esperado).
- [x] `SETUP.md` no fue modificado y no se creó ninguna carpeta fuera de su estructura.
- [x] No se agregaron dependencias a `package.json`.

## 7. Preguntas abiertas

**Resueltas por el usuario (2026-09-05): los 4 defaults quedan confirmados.**

- **`BottomNav` no aparece en `Movil.dc.html`.** Default: cascarón con 3 tabs —
  Inicio (`/`), Catálogo (`/catalogo`), Cuenta (`/login`) — con íconos al estilo del resto
  de la maqueta. Si querés otras tabs o ninguna barra, decilo.
- **Íconos de categoría.** La API no tiene campo de ícono. Default: mapa
  `slug → svg` local en `CategoryCard` con los 6 íconos de la maqueta; las categorías sin
  match caen a un ícono genérico.
- **Placeholders que quedan entre corchetes** (ya acordado, se listan para el reviewer):
  `[MARCA]` (header y footer), bajada del hero, `[correo de contacto]` y
  `[teléfono / WhatsApp]` del footer, y el destino del botón "Consultar disponibilidad".
- **`EmptyState` en el catálogo:** como no hay filtrado, el "Ningún producto coincide" se
  deja renderizado tras un flag local en `CatalogPage` (o comentado) solo para que el spec
  002 lo enganche. Confirmar que alcanza con eso.

## 8. Hallazgos de review de accesibilidad (ronda 3)

Corregidos en esta ronda (todo UI, sin capa de datos, sin ampliar el alcance):

- **`<main>` anidado:** `CatalogPage` usaba `<main>` propio dentro del `<main>` de
  `StoreLayout`. Pasado a `<div>` (una sola landmark `main` por página).
- **Íconos decorativos:** `aria-hidden="true"` + `focusable="false"` por defecto en el
  helper `box()` de `components/ui/icons.jsx` y en la `<svg>` inline de `CategoryCard`.
- **`prefers-reduced-motion`:** bloque global en `src/index.css` que neutraliza
  animaciones, transiciones y `scroll-behavior`.
- **Contraste:** `--color-faint` `#6f6f78 → #9a9aa3` y `--color-faint-2` `#5c5c65 → #8a8a93`
  (hints y placeholders ahora AA sobre el fondo `#080808`).
- **`AccountMenu`:** se quitaron `role="menu"`/`role="menuitem"` (patrón menú-de-navegación,
  no menú ARIA). Cierra con `Escape`, con click afuera (`ref` + listener en `document`) y al
  navegar (`onClick` en cada `<Link>`). Un `useEffect` con dependencia `[open]`.
- **Safe area:** `BottomNav` y el `padding-bottom` móvil de `StoreLayout` suman
  `env(safe-area-inset-bottom)`.
- **Switch "Solo con stock":** thumb visible que se desplaza (`peer-checked`), no depende
  solo del color de fondo; anillo `focus-visible`.
- **`focus-visible`:** anillo de foco en `Button`, `IconButton`, `<select>` de
  `ResultsToolbar`, `FIELD` de `FilterSidebar`, los `<Link>` de "Ver detalle"
  (`ProductCard`), `CategoryCard`, los `<Link>`/`<NavLink>` de nav de `Header` y `BottomNav`,
  y el toggle + los `<Link>` de `AccountMenu`.

Archivo nuevo respecto de la sección 4: ninguno. Se editaron `index.css`, `icons.jsx`,
`CategoryCard.jsx`, `AccountMenu.jsx`, `BottomNav.jsx`, `StoreLayout.jsx`,
`FilterSidebar.jsx`, `Button.jsx`, `IconButton.jsx`, `ProductCard.jsx`,
`ResultsToolbar.jsx`, `Header.jsx`, `CatalogPage.jsx`.

## 9. Diferido a 002 (no se tocó en la ronda 3)

- Controles "cascarón" del spec sin handler: hamburguesa y lupa del `Header`, "Limpiar" de
  `FilterSidebar`, `CategoryChips`, la "x" de `ActiveFilters`, las flechas de paginación.
  Se activan cuando 002 conecte filtros/orden/paginación.
- `<a href="/#novedades">` / `#categorias`: quedan como anclas.
- `<fieldset>`/`<legend>` para los grupos de `FilterSidebar`, y un skip-link al contenido.
- El prop `variant` de `Badge` (hoy `nuevo` y `stock` renderizan igual).
- `formatPrice` con `Intl.NumberFormat` `style: "currency"` en vez del prefijo `"S/ "` manual.
- `ProductMeta`: el punto de estado es siempre `bg-acc`; darle color según `is_active`
  (marcado con `TODO(002)` en el código).
- `index.html`: `theme-color` y `<link rel="preconnect">` para las fuentes.
- `ProductDetailPage`: manejo real de `id` inexistente (hoy cae al primer producto de
  muestra).
- Datos de muestra triplicados en las 3 páginas: los reemplaza la capa de datos de 002.
