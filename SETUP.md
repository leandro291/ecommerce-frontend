# SETUP — Arquitectura y puesta en marcha

Este documento es la referencia obligatoria de estructura de carpetas y dependencias.
Está referenciado desde [`CLAUDE.md`](./CLAUDE.md); toda tarea debe respetarlo.

---

## 1. Requisitos

- Node.js >= 20 (verificado sobre v24.19.0)
- La API de Django corriendo y accesible (por defecto `http://localhost:8000`)

## 2. Creación del proyecto

```bash
npm create vite@latest . -- --template react
npm install
```

> Se usa la plantilla `react` (JavaScript), **no** `react-ts`.

## 3. Dependencias

### Runtime

```bash
npm install @tanstack/react-query react-router tailwindcss @tailwindcss/vite
```

| Paquete | Versión | Rol |
|---|---|---|
| `react` / `react-dom` | 19.2.8 | Base (viene con la plantilla) |
| `@tanstack/react-query` | 5.102.8 | Estado del servidor |
| `react-router` | 8.3.1 | Ruteo |
| `tailwindcss` | 4.3.3 | Estilos |
| `@tailwindcss/vite` | 4.3.3 | Integración de Tailwind con Vite |

### Desarrollo

```bash
npm install -D @tanstack/react-query-devtools
```

| Paquete | Versión | Rol |
|---|---|---|
| `vite` | 8.2.2 | Build (viene con la plantilla) |
| `@vitejs/plugin-react` | 6.1.1 | Fast Refresh (viene con la plantilla) |
| `@tanstack/react-query-devtools` | 5.102.8 | Inspección del cache en dev |

### Deliberadamente NO instaladas

| Paquete | Por qué no | Cuándo agregarlo |
|---|---|---|
| `axios` | `fetch` nativo cubre todo lo que necesitamos | Nunca, salvo que haga falta subir archivos con progreso |
| `zod` | La API ya valida; el cliente valida con la Constraint Validation API del navegador | Si aparece validación cruzada compleja en el cliente |
| `react-hook-form` | Los formularios de un CRUD se resuelven con `<form>` no controlado + `FormData` | Si un formulario supera ~8 campos con validación en vivo |
| `zustand` / `redux` | TanStack Query ya es el estado global de servidor; el resto es `useState` | Si aparece estado de cliente compartido no trivial (ej. carrito) |

## 4. Configuración de Tailwind v4

Tailwind 4 **no usa** `tailwind.config.js` ni PostCSS. Solo dos pasos:

`vite.config.js`:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

`src/index.css`:

```css
@import "tailwindcss";
```

La personalización del tema se hace en CSS con `@theme`, no en un archivo de config JS.

## 5. Variables de entorno

`.env` (no se commitea) — hay un `.env.example` versionado como plantilla:

```
VITE_API_URL=http://localhost:8000/api/v1
```

Solo las variables con prefijo `VITE_` llegan al navegador. **Nunca** poner secretos ahí:
todo lo que empieza con `VITE_` queda embebido en el bundle público.

---

## 6. Estructura de carpetas

Arquitectura **por features** (screaming architecture): la carpeta grita qué hace el
negocio, no con qué librería está hecho.

```
.
├── CLAUDE.md                    # Reglas del repo y referencias a los agentes
├── SETUP.md                     # Este documento
├── vite.config.js
├── .env.example
├── .claude/
│   └── agents/                  # orquestador, spec, developer, reviewer
├── docs/
│   ├── ecommerce-api.yaml       # Contrato OpenAPI: única fuente de verdad
│   └── specs/                   # Specs SDD aprobados, uno por funcionalidad
└── src/
    ├── main.jsx                 # Punto de entrada: providers + router
    ├── index.css                # @import "tailwindcss" + @theme
    │
    ├── app/
    │   ├── router.jsx           # Definición de rutas (React Router)
    │   └── queryClient.js       # QueryClient con sus defaultOptions
    │
    ├── lib/
    │   ├── apiClient.js         # Wrapper de fetch: base URL, JWT, errores, query params
    │   └── ApiError.js          # Error tipado con status y detalle del backend
    │
    ├── features/                # UN DIRECTORIO POR MÓDULO DE LA API
    │   ├── categories/
    │   │   ├── api/             # Funciones puras que hablan con la API
    │   │   │   └── categoriesApi.js
    │   │   ├── queries/         # queryOptions + hooks de TanStack Query
    │   │   │   ├── categoryKeys.js
    │   │   │   ├── useCategories.js
    │   │   │   └── useCategoryMutations.js
    │   │   ├── components/      # Componentes propios del módulo
    │   │   │   ├── CategoryTable.jsx
    │   │   │   └── CategoryForm.jsx
    │   │   └── pages/           # Componentes que montan una ruta
    │   │       ├── CategoryListPage.jsx
    │   │       └── CategoryDetailPage.jsx
    │   ├── products/            # misma estructura interna
    │   ├── roles/               # misma estructura interna
    │   └── users/               # PENDIENTE: falta el spec en el yaml
    │
    ├── components/              # Compartido entre 2+ features
    │   ├── ui/                  # Button, Input, Modal, Badge, Spinner...
    │   └── layout/              # AppLayout, Sidebar, Header
    │
    ├── hooks/                   # Hooks transversales (useDebounce, usePagination)
    └── utils/                   # Helpers puros (formatPrice, formatDate)
```

### Reglas de la estructura

1. **Un directorio en `features/` por módulo de la API.** No se crean features que no
   correspondan a un recurso del backend.
2. **Nada sube a `components/` hasta que lo use un segundo feature.** Regla de dos: la
   primera vez vive dentro del feature, la segunda vez se promueve.
3. **Un feature no importa de otro feature.** Si `products` necesita categorías para un
   `<select>`, consume el hook público de `categories/queries/`, nunca sus internals.
4. **Flujo de datos, en un solo sentido:**

   ```
   pages/ → components/ → queries/ → api/ → lib/apiClient.js → API Django
   ```

   Un componente nunca llama a `fetch` ni a `api/` directo: siempre pasa por `queries/`.
5. **`api/` no conoce React.** Son funciones async puras, testeables sin renderizar nada.

---

## 7. Capa de datos

### `lib/apiClient.js`

Único punto donde se habla HTTP. Responsabilidades:

- Prefijar `VITE_API_URL`.
- Adjuntar `Authorization: Bearer <access>` (SimpleJWT).
- Al recibir 401, intentar una vez el refresh contra `/token/refresh/` y reintentar; si
  falla, limpiar la sesión.
- Serializar query params (los filtros del yaml: `search`, `ordering`, `page`, `is_active`,
  `category`, `price_min`, `price_max`, `in_stock`, `code`, `name`).
- Convertir cualquier respuesta no-ok en un `ApiError` con `status` y el detalle del backend.
- Devolver `null` en 204 (los `DELETE` de la API responden 204 sin cuerpo).

### `app/queryClient.js`

```js
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,      // el catálogo no cambia cada segundo
      retry: (failCount, error) =>
        error?.status >= 400 && error?.status < 500 ? false : failCount < 2,
      refetchOnWindowFocus: false,
    },
  },
})
```

No reintentar ante 4xx: un 400 o un 404 no mejoran repitiendo la llamada.

### Query keys

Cada feature expone una factory en `queries/<feature>Keys.js`, para que invalidar sea
preciso y no se escriban strings sueltos:

```js
export const categoryKeys = {
  all: ['categories'],
  lists: () => [...categoryKeys.all, 'list'],
  list: (filters) => [...categoryKeys.lists(), filters],
  details: () => [...categoryKeys.all, 'detail'],
  detail: (id) => [...categoryKeys.details(), id],
}
```

Tras una mutación se invalida el nivel más chico que alcance: crear o borrar invalida
`lists()`; editar invalida `detail(id)` y `lists()`.

---

## 8. Mapa de la API

Base: `VITE_API_URL` (`http://localhost:8000/api/v1`). Todos los endpoints exigen
`Authorization: Bearer <token>`. Las listas vienen paginadas:
`{ count, next, previous, results }`.

| Recurso | Endpoints | Filtros de la lista |
|---|---|---|
| **categories** | `GET/POST /categories/` · `GET/PUT/PATCH/DELETE /categories/{id}/` | `is_active`, `name`, `search`, `ordering`, `page` |
| **products** | `GET/POST /products/` · `GET/PUT/PATCH/DELETE /products/{id}/` | `category`, `in_stock`, `is_active`, `price_min`, `price_max`, `search`, `ordering`, `page` |
| **roles** | `GET/POST /roles/` · `GET/PUT/PATCH/DELETE /roles/{id}/` | `code`, `name`, `search`, `ordering`, `page` |
| **users** | — | **Pendiente: no está en el yaml** |

### Detalles del contrato que importan al construir la UI

- **`price` es un string, no un número.** Viene como `"1234.56"` (decimal de Django, máximo
  8 enteros y 2 decimales). No hacer aritmética con floats: formatear para mostrar y enviar
  string al escribir.
- **Producto: leer y escribir tienen forma distinta.** `ProductRead` trae `category` como
  objeto anidado (`{id, name, slug}`); `ProductWrite` espera `category` como **integer**.
  El formulario envía el id, la tabla lee el objeto.
- **`code` de un rol es inmutable.** Se puede enviar al crear, pero es `readOnly` en el
  update: el campo va deshabilitado en el formulario de edición.
- **`user_count` de un rol es de solo lectura.** No mandarlo nunca en un POST/PUT.
- **`slug` de una categoría** debe cumplir `^[-a-zA-Z0-9_]+$`, máximo 120 caracteres.
- **PUT vs PATCH.** PUT exige el objeto completo; para ediciones parciales usar PATCH.
- **DELETE responde 204 sin cuerpo.** No intentar parsear JSON en esa respuesta.

---

## 9. Comandos

```bash
npm run dev       # servidor de desarrollo
npm run build     # build de producción a dist/
npm run preview   # sirve el build para verificarlo
```
