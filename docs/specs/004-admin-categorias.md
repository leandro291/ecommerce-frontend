# 004 — Panel de administración: shell + CRUD de categorías

- **Estado:** Descartado (2026-09-06). El backend ya sirve el admin de Django en
  `/admin/`; en vez de construir un CRUD propio se agrega un enlace externo en
  `AccountMenu`. Se mantiene el archivo como registro de la decisión.
- **Estado original:** Borrador
- **Fecha:** 2026-09-06
- **Módulos de la API:** categories (auth solo como fuente de la sesión)

## 1. Objetivo

Quien administra la tienda puede crear, editar, activar/desactivar y dar de baja las
categorías del catálogo sin entrar al admin de Django. Las pantallas viven bajo `/admin`, con
su propio layout, separadas de la tienda pública. Este spec también deja armado el shell del
panel (guarda de ruta, layout y navegación) para que los CRUD de productos y roles sean
copias mecánicas del mismo patrón.

## 2. Alcance

Es el **primer spec del panel**. Trae el shell completo más un solo recurso: `categories`, que
es el más chico del contrato (`name`, `slug`, `description`, `is_active`). Productos y roles
van en los specs 005 y 006, en ese orden, reusando todo lo que se construye acá.

### Entra

- `src/app/ProtectedRoute.jsx`: guarda de ruta prevista en `SETUP.md` §6 y hoy inexistente.
- Layout propio del panel (header con marca, navegación y salida a la tienda).
- Rutas `/admin` → `/admin/categorias`, fuera de `StoreLayout`.
- Lista de categorías paginada con estados de carga, error y vacío.
- Alta, edición y baja de una categoría, con la lista actualizándose sola tras cada mutación.
- Manejo explícito de tres respuestas de escritura: 400 (errores por campo), 403 (sin permisos)
  y 409 en el `DELETE` (la categoría todavía tiene productos vivos).
- Entrada al panel desde el menú "Cuenta" cuando hay sesión.

### No entra

- **Verificación real de permisos en el cliente.** Decisión ya tomada con el usuario: el gate
  es optimista. `ProtectedRoute` chequea únicamente `isAuthenticated` de `useSession`. No se
  decodifica el JWT, no se sondean endpoints y no existe `GET /auth/me/` en el yaml. El backend
  es el único portero: una escritura que vuelve 403 se muestra como aviso y no rompe la
  pantalla.
- **CRUD de productos y de roles.** Specs 005 y 006. Se hacen después porque el patrón se
  valida primero con el recurso más simple: `products` arrastra `ProductRead` vs `ProductWrite`
  y `price` como string; `roles`, el `code` inmutable.
- **CRUD de usuarios.** No hay endpoint en el yaml y `CLAUDE.md` lo prohíbe explícitamente.
- **Dashboard, métricas o página de inicio del panel.** `/admin` redirige a la lista de
  categorías. No hay datos agregados en el contrato para llenar un dashboard.
- **`CategoryDetailPage.jsx`** (listada en `SETUP.md` §6). Una categoría tiene cuatro campos
  escribibles: la lista más el formulario ya los muestran todos. Una pantalla de detalle sería
  una tercera vista del mismo objeto sin nada nuevo que mostrar. Se agrega si aparece algo que
  solo tenga sentido en detalle (por ejemplo, los productos de esa categoría).
- **Buscador, filtros y ordenamiento en el admin.** Los filtros del yaml (`search`, `name`,
  `is_active`, `ordering`) existen, pero con paginación ya se llega a cualquier categoría. Se
  agregan cuando el volumen lo pida, en una tarea aparte.
- **Modales.** El formulario se muestra en la misma página, sobre la tabla. Un modal accesible
  (foco atrapado, `Escape`, scroll lock) es código que hoy nadie pidió.
- **Borrado optimista o `undo`.** La mutación invalida y refetchea; es una pantalla de
  administración, no una bandeja de entrada.
- **Tocar `apiClient`, `tokenStore` o el `QueryClient`.** Ya sirven todo lo que hace falta:
  `Authorization` automático, refresh ante 401 y `null` en 204.

## 3. Contrato de la API

Base: `VITE_API_URL`. Los paths del yaml ya incluyen `/api/v1`.

| Método | Endpoint | Params / Body | Respuesta |
|---|---|---|---|
| GET | `/categories/` | `page` (int); también acepta `is_active`, `name`, `search`, `ordering` (no se usan acá) | 200 · `PaginatedCategoryList` = `{ count, next, previous, results: Category[] }` |
| POST | `/categories/` | `Category` | 201 · `Category` |
| PATCH | `/categories/{id}/` | `PatchedCategory` | 200 · `Category` |
| DELETE | `/categories/{id}/` | — | 204 sin cuerpo |

Schema `Category` (único para leer y escribir):

| Campo | Tipo | Escribible | Reglas del yaml |
|---|---|---|---|
| `id` | integer | no (`readOnly`) | — |
| `name` | string | sí | `maxLength: 100`. **Único campo escribible en `required`** |
| `slug` | string | sí | `maxLength: 120`, `pattern: ^[-a-zA-Z0-9_]+$` |
| `description` | string | sí | sin límite declarado |
| `is_active` | boolean | sí | — |
| `created_at` / `updated_at` | date-time | no (`readOnly`) | — |

Trampas del contrato relevantes acá:

- **`required` del schema es `[created_at, id, name, updated_at]`**, y tres de esos cuatro son
  `readOnly`. O sea: **al escribir, el único campo obligatorio es `name`.** `slug`,
  `description` e `is_active` son opcionales.
- **El `DELETE` no siempre borra.** Su `description` dice textualmente: *"Soft delete unless the
  category still has live products (then 409)"*. El yaml solo declara la respuesta 204, así que
  el cuerpo del 409 es desconocido: la UI muestra un mensaje propio ante `status === 409` en vez
  de reenviar lo que venga. Y como es un *soft delete*, tras borrar la categoría puede seguir
  existiendo en la lista con `is_active: false` — depende de si el backend filtra las inactivas
  del `GET`. Ver «Preguntas abiertas» 2.
- **`DELETE` responde 204 sin cuerpo.** `apiClient` ya devuelve `null` ahí; no hay que parsear.
- **PUT vs PATCH.** `PUT` exige el objeto completo; la edición usa **PATCH** con
  `PatchedCategory`, que no tiene ningún campo `required`.
- **Las escrituras exigen `Authorization`.** El yaml marca `security: jwtAuth` en las cuatro
  operaciones, y la `description` del viewset aclara *"public read, staff write"*: el `GET` es
  público (confirmado en el spec 003), el resto no. `apiClient` ya adjunta el token si existe.
- **El yaml no declara respuestas 400, 401, 403 ni 409** para estas operaciones. Los mensajes
  del cliente se deciden por `error.status`, no por el cuerpo. Para el 400 se asume la forma de
  DRF (`{ campo: ["mensaje"] }`), igual que en el spec 003, con degradación a un aviso genérico
  si el cuerpo tiene otra forma.
- **La lista viene paginada** y el yaml no declara el tamaño de página. Se navega con `next` /
  `previous` del payload, que son las únicas señales confiables de si hay más páginas.

## 4. Archivos afectados

Todas las rutas están previstas en `SETUP.md` §6. **No se crea ninguna carpeta nueva y
`SETUP.md` no necesita cambios.**

| Ruta | Acción | Responsabilidad |
|---|---|---|
| `src/app/ProtectedRoute.jsx` | crear | Sin `isAuthenticated`, redirige a `/login` guardando la ruta de origen; con sesión, renderiza `<Outlet />` |
| `src/components/layout/AdminLayout.jsx` | crear | Shell del panel: header propio, navegación del panel, `<Outlet />` |
| `src/app/router.jsx` | editar | Rama `/admin` con `ProtectedRoute` + `AdminLayout`, hermana de `StoreLayout` |
| `src/features/categories/api/categoriesApi.js` | editar | Sumar `createCategory`, `updateCategory`, `deleteCategory` junto a `listCategories` |
| `src/features/categories/queries/useCategoryMutations.js` | crear | Las tres mutaciones, cada una invalidando `categoryKeys.lists()` |
| `src/features/categories/components/CategoryForm.jsx` | crear | `<form>` no controlado para alta y edición, con errores por campo |
| `src/features/categories/components/CategoryTable.jsx` | crear | Tabla de resultados + acciones por fila |
| `src/features/categories/pages/CategoryListPage.jsx` | crear | Ruta `/admin/categorias`: orquesta query, paginación, formulario y mutaciones |
| `src/components/layout/AccountMenu.jsx` | editar | Con sesión, agregar el enlace "Administración" → `/admin` |

Cinco decisiones de estructura, para que no sorprendan en review:

1. **`AdminLayout` va en `components/layout/`, no dentro de un feature.** La regla de dos de
   `SETUP.md` §6 habla de componentes de un feature; este no es de ninguno: lo monta
   `app/router.jsx` y va a envolver a `categories`, `products` y `roles`. Es el hermano exacto
   de `StoreLayout`, que ya vive ahí.
2. **La navegación del panel es un `<nav>` dentro de `AdminLayout`**, no un `Sidebar.jsx`
   aparte. Hoy tiene un solo enlace. Se parte cuando entren productos y roles, si para entonces
   el archivo lo pide.
3. **`categoryKeys.js` y `listCategories` no se tocan.** Ya existen del spec 002 y la lista del
   admin es la misma query con otro filtro (`{ page }`). No se duplica la factory de keys ni el
   hook `useCategories`.
4. **Un solo archivo de mutaciones, `useCategoryMutations.js`**, tal como lo nombra
   `SETUP.md` §6. Tres hooks en tres archivos serían el mismo `invalidateQueries` copiado tres
   veces.
5. **`CategoryForm` es uno solo para alta y edición.** Cambian el `defaultValue` de los campos y
   el texto del botón; el resto es idéntico. Dos componentes serían un 90 % de duplicación.

## 5. Tareas

- [ ] **T1 — Guarda de ruta**
  - Archivo: `src/app/ProtectedRoute.jsx`
  - Qué hace: componente sin props que lee `isAuthenticated` de `useSession`. Sin sesión
    devuelve `<Navigate to="/login" replace state={{ from: location.pathname }} />`; con sesión
    devuelve `<Outlet />`. **No mira roles ni decodifica el token.** Un comentario en el archivo
    deja escrito que el gate es optimista y que el backend es el portero real.
  - Hecho cuando: entrar a `/admin/categorias` sin sesión termina en `/login`, y al ingresar se
    vuelve a `/admin/categorias` (el `state.from` que `LoginPage` ya consume); con sesión, la
    ruta se renderiza sin redirect.

- [ ] **T2 — Layout del panel**
  - Archivo: `src/components/layout/AdminLayout.jsx`
  - Qué hace: header propio con el nombre del panel, un `<nav>` con un `NavLink` a
    `/admin/categorias` (marcado cuando está activo), un enlace de vuelta a la tienda (`/`) y
    `<Outlet />` en un `<main>`. Sin `Header`, `Footer` ni `BottomNav` de la tienda. Estilos con
    las clases del tema ya existentes (`bg-bg`, `text-fg`, `border-line`…).
  - Hecho cuando: `/admin/categorias` se ve con el header del panel y sin el de la tienda; el
    enlace de la nav aparece resaltado al estar en esa ruta.

- [ ] **T3 — Rutas del panel**
  - Archivo: `src/app/router.jsx`
  - Qué hace: agrega un segundo elemento de primer nivel: `path: "admin"`, `element:
    <ProtectedRoute />`, con un hijo `element: <AdminLayout />` que a su vez tiene
    `{ index: true, element: <Navigate to="categorias" replace /> }` y
    `{ path: "categorias", element: <CategoryListPage /> }`. Las rutas existentes de
    `StoreLayout` no se tocan: siguen públicas.
  - Hecho cuando: `/admin` con sesión aterriza en `/admin/categorias`; `/`, `/catalogo` y
    `/productos/:id` se siguen navegando sin sesión.

- [ ] **T4 — Escrituras en la capa `api/`**
  - Archivo: `src/features/categories/api/categoriesApi.js`
  - Qué hace: agrega tres funciones async puras junto a `listCategories`:
    `createCategory(body)` → `POST /categories/`; `updateCategory({ id, body })` →
    `PATCH /categories/{id}/`; `deleteCategory(id)` → `DELETE /categories/{id}/`. Sin React y
    sin tocar `tokenStore`.
  - Hecho cuando: `createCategory({ name: 'Test' })` crea la categoría y devuelve el objeto con
    `id`; `deleteCategory(id)` resuelve a `null` (204) sin lanzar.

- [ ] **T5 — Hook de mutaciones**
  - Archivo: `src/features/categories/queries/useCategoryMutations.js`
  - Qué hace: `useCategoryMutations()` devuelve `{ create, update, remove }`, tres
    `useMutation` cuyo `onSuccess` hace
    `queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })`. Se invalida `lists()` y
    no `detail(id)` porque hoy no existe ninguna query de detalle de categoría; cuando exista,
    `update` suma esa invalidación.
  - Hecho cuando: tras crear, editar o borrar, la tabla se actualiza sola sin recargar la
    página; el cache de `categoryKeys.list({ page: 1 })` queda marcado como stale.

- [ ] **T6 — Formulario de categoría**
  - Archivo: `src/features/categories/components/CategoryForm.jsx`
  - Qué hace: `<form>` **no controlado** que en el submit arma el body con `FormData` y lo pasa
    a `onSubmit`. Campos: `name` (`required`, `maxLength=100`), `slug`
    (`pattern="[-a-zA-Z0-9_]+"`, `maxLength=120`, opcional, con una nota de que se genera solo
    si se deja vacío), `description` (`<textarea>`, opcional) e `is_active`
    (`<input type="checkbox">`). Props: `category` (para los `defaultValue` al editar),
    `submitLabel`, `isPending`, `errors`, `onSubmit`, `onCancel`. Reusa `AuthField`
    de `features/auth/`… **no**: un feature no importa de otro (`SETUP.md` §6 regla 3), así que
    el label + input + error se escribe local al componente. Ver «Preguntas abiertas» 3.
  - Hecho cuando: enviar con `name` vacío es bloqueado por el navegador sin llegar a la red;
    con `slug` = `"con espacios"` el navegador muestra su aviso nativo de patrón; el body que
    llega a `onSubmit` omite `slug` y `description` cuando quedaron vacíos, e incluye siempre
    `is_active` como booleano (marcado o no).

- [ ] **T7 — Estado pendiente del formulario**
  - Archivo: `src/features/categories/components/CategoryForm.jsx`
  - Qué hace: el botón de envío queda `disabled` mientras `isPending` y su texto cambia a
    "Guardando…".
  - Hecho cuando: doble clic rápido en Guardar dispara una sola request.

- [ ] **T8 — Errores por campo en el formulario**
  - Archivo: `src/features/categories/components/CategoryForm.jsx`
  - Qué hace: la prop `errors` es un objeto `{ campo: "mensaje" }`; cada campo que tenga entrada
    muestra el texto debajo del input, con `aria-invalid` y `aria-describedby`.
  - Hecho cuando: pasándole `{ slug: 'Ya existe una categoría con ese slug' }`, el mensaje sale
    bajo el campo `slug` y un lector de pantalla lo anuncia al enfocarlo.

- [ ] **T9 — Tabla de categorías**
  - Archivo: `src/features/categories/components/CategoryTable.jsx`
  - Qué hace: `<table>` semántica con una fila por categoría: `name`, `slug`, `description`
    (truncada), estado activo/inactivo con el `Badge` de `components/ui/` y dos botones,
    "Editar" y "Eliminar", que llaman a `onEdit(category)` y `onDelete(category)`. No conoce
    TanStack Query ni `api/`: solo recibe props.
  - Hecho cuando: con 5 categorías se ven 5 filas con su estado correcto, y los botones disparan
    los callbacks con la categoría de esa fila.

- [ ] **T10 — Página de la lista**
  - Archivo: `src/features/categories/pages/CategoryListPage.jsx`
  - Qué hace: usa `useCategories({ page })` y envuelve la tabla en el `QueryState` existente
    (`components/ui/QueryState.jsx`) para carga y error, con `refetch` como `onRetry`. Si la
    query resuelve con `results` vacío, muestra `EmptyState` con "Todavía no hay categorías" en
    vez de la tabla. Encabezado con el título y un botón "Nueva categoría".
  - Hecho cuando: con la API caída se ve el bloque de error con botón Reintentar; con la lista
    vacía se ve el estado vacío; con datos se ve la tabla.

- [ ] **T11 — Paginación**
  - Archivo: `src/features/categories/pages/CategoryListPage.jsx`
  - Qué hace: `useState` con la página actual y dos botones, Anterior y Siguiente, deshabilitados
    según `previous` / `next` del payload. Sin números de página: el contrato no expone el tamaño
    de página, así que no se puede calcular cuántas hay.
  - Hecho cuando: con más de una página, Siguiente carga la segunda y Anterior vuelve; en la
    primera página Anterior está `disabled`, y en la última lo está Siguiente.

- [ ] **T12 — Alta y edición desde la página**
  - Archivo: `src/features/categories/pages/CategoryListPage.jsx`
  - Qué hace: un `useState` `editing` con tres valores posibles: `null` (form oculto),
    `"new"` (alta) o el objeto categoría (edición). "Nueva categoría" lo pone en `"new"`;
    "Editar" de una fila, en esa categoría. El formulario se renderiza sobre la tabla y llama a
    `create.mutate` o `update.mutate` según el caso. Al resolverse bien, `editing` vuelve a
    `null`.
  - Hecho cuando: crear una categoría la muestra en la tabla sin recargar y cierra el
    formulario; editar el nombre de una existente actualiza esa fila; Cancelar cierra el
    formulario sin mandar nada.

- [ ] **T13 — Baja con confirmación**
  - Archivo: `src/features/categories/pages/CategoryListPage.jsx`
  - Qué hace: "Eliminar" pide confirmación con `window.confirm` nativo (nombre de la categoría
    en el texto) y, si se acepta, llama a `remove.mutate(id)`. Sin diálogo propio: el nativo ya
    es accesible y bloqueante.
  - Hecho cuando: cancelar el `confirm` no dispara ninguna request; aceptar quita la categoría
    de la tabla sin recargar.

- [ ] **T14 — Traducción de los errores de escritura**
  - Archivo: `src/features/categories/pages/CategoryListPage.jsx`
  - Qué hace: una función local que mapea el `ApiError` de cualquiera de las tres mutaciones a
    lo que ve el usuario, por `status`:
    - `403` → aviso "No tenés permisos para esta acción." La pantalla sigue usable: no se
      redirige, no se cierra sesión, no se vacía la tabla.
    - `409` (solo en el borrado) → "No se puede eliminar: la categoría todavía tiene productos."
    - `400` → si el cuerpo es `{ campo: [...] }`, va a la prop `errors` del formulario; las
      claves que no sean campos del form (`detail`, `non_field_errors`) van al aviso de arriba.
    - cualquier otro → "No pudimos guardar los cambios. Probá de nuevo."
    El `401` no se trata acá: lo resuelve `apiClient` con el refresh y, si falla, la salida a
    `/login`.
  - Hecho cuando: con una cuenta sin permisos de staff, crear una categoría muestra el aviso de
    permisos y la tabla sigue en pantalla; borrar una categoría con productos vivos muestra el
    mensaje del 409; crear una con un `slug` repetido muestra el error bajo ese campo.

- [ ] **T15 — Entrada al panel desde el menú Cuenta**
  - Archivo: `src/components/layout/AccountMenu.jsx`
  - Qué hace: en la rama con sesión, un `Link` a `/admin` con la etiqueta "Administración",
    sobre "Cerrar sesión", con el mismo `linkClass` y cerrando el menú al navegar. Sin sesión el
    menú no cambia.
  - Hecho cuando: con sesión, el menú muestra "Administración" y lleva a `/admin/categorias`;
    sin sesión, la opción no aparece.

## 6. Criterios de aceptación

- [ ] `npm run build` pasa sin errores.
- [ ] `npm run lint` pasa sin errores nuevos.
- [ ] No se agregaron dependencias a `package.json`; cero archivos `.ts` / `.tsx`.
- [ ] No se creó ninguna carpeta fuera de la estructura de `SETUP.md`.
- [ ] Ningún componente llama a `fetch` ni importa `features/categories/api/`: el camino es
      página → `queries/` → `api/` → `apiClient`.
- [ ] `categoryKeys.js` sigue siendo el único lugar donde se arman las keys de categorías: no
      hay ningún array literal `['categories', ...]` suelto en `src/`.
- [ ] `src/lib/apiClient.js`, `ApiError.js` y `tokenStore.js` quedaron sin cambios.
- [ ] Sin sesión, `/admin` y `/admin/categorias` redirigen a `/login`; tras ingresar se vuelve a
      la ruta pedida.
- [ ] Con sesión, `/admin/categorias` se renderiza para **cualquier** usuario autenticado: no
      hay ninguna comprobación de rol en el cliente ni ningún `atob`/`jwtDecode` en `src/`.
- [ ] La tienda pública sigue intacta: `/`, `/catalogo` y `/productos/:id` se navegan sin sesión
      y no muestran el layout del panel.
- [ ] Estados de carga, error y vacío de la lista, cubiertos y visibles.
- [ ] Tras crear, editar o borrar, la lista se refleja sin recargar la página.
- [ ] El botón de envío del formulario está `disabled` mientras la mutación está pendiente.
- [ ] Un 403 en cualquier escritura muestra "No tenés permisos para esta acción" y deja la
      pantalla usable.
- [ ] Un 409 al borrar muestra el mensaje de productos asociados y la categoría sigue en la
      tabla.
- [ ] Un 400 con errores por campo los muestra bajo el input correspondiente.
- [ ] El body de POST y PATCH solo contiene `name`, `slug`, `description` e `is_active`: nunca
      `id`, `created_at` ni `updated_at`.
- [ ] La edición usa `PATCH`, no `PUT`.
- [ ] `name` vacío o `slug` con caracteres fuera de `^[-a-zA-Z0-9_]+$` son bloqueados por el
      navegador antes de llegar a la red.
- [ ] Con más de una página, Anterior/Siguiente navegan y se deshabilitan en los extremos.

## 7. Preguntas abiertas

Ninguna es bloqueante: las cuatro tienen un default y el spec se puede aprobar tal cual.

1. **Etiqueta y alcance visible del panel.** El menú "Cuenta" va a mostrar "Administración" a
   todo usuario con sesión, incluido el que no tiene permisos: es la consecuencia directa del
   gate optimista ya acordado. **Default:** se muestra igual; el que no es staff verá el aviso
   de permisos al intentar guardar. Si preferís esconder el enlace, la única forma sin backend
   es recordar en `localStorage` si alguna escritura previa dio 403, que es peor que el aviso.
2. **Qué pasa con una categoría tras el `DELETE`.** El yaml dice *soft delete*, pero no aclara
   si el `GET /categories/` sigue listando las inactivas. **Default:** se invalida la lista y se
   muestra lo que devuelva el backend; si la categoría reaparece con `is_active: false`, es el
   comportamiento correcto y la tabla ya lo distingue con el `Badge`. Se verifica al implementar
   contra la API desplegada.
3. **Duplicación del campo de formulario.** `AuthField` (feature `auth`) hace exactamente lo que
   necesita `CategoryForm`, pero `SETUP.md` §6 regla 3 prohíbe que un feature importe de otro.
   **Default:** se escribe el campo local a `CategoryForm` en esta iteración. Cuando llegue el
   segundo formulario del panel (productos, spec 005), se promueve **uno solo** a
   `components/ui/Field.jsx` y ahí también migra `AuthField` —regla de dos. Si preferís
   promoverlo ya en este spec, es una tarea extra y toca los dos formularios de auth.
4. **Qué falta para cerrar el panel.** Con este spec el admin gestiona categorías y nada más.
   El orden propuesto es 005 productos (el más pesado: `ProductWrite` con `category` como
   integer y `price` como string) y 006 roles (`code` inmutable en el update). Si querés otro
   orden, se dice ahora y se numeran al revés.
