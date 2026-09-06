# 003 — Login y registro de la tienda pública

- **Estado:** Aprobado (2026-09-06, con la clave `ecommerce.user` en SETUP.md §7)
- **Fecha:** 2026-09-06
- **Módulos de la API:** auth

## 1. Objetivo

El visitante puede crear una cuenta y entrar con su correo. **Toda la tienda se sigue usando
sin cuenta**: el home, el catálogo y la ficha de producto son públicos y ninguna pantalla pide
sesión. La cuenta existe para la feature de compras que vendrá después. Una vez adentro, la
sesión sobrevive a recargar la página y se renueva sola mientras el token de refresco siga
vivo. El menú "Cuenta" del header deja de llevar a dos páginas inexistentes y pasa a mostrar un
avatar con las iniciales de quien está conectado.

## 2. Alcance

Este spec es el **dueño de la capa base de datos** (`ApiError`, `tokenStore`, `apiClient`,
`queryClient`, `QueryClientProvider`). El spec 002 la daba por hecha en sus tareas T1–T5: al
hacerse auth primero, esas cinco tareas se mueven acá y 002 queda consumiéndolas.

### Entra

- `src/lib/ApiError.js`, `src/lib/tokenStore.js`, `src/lib/apiClient.js`,
  `src/app/queryClient.js` y los providers en `main.jsx`.
- El **flujo de refresco completo** de `SETUP.md` §7: 401 → un solo refresh (deduplicado entre
  peticiones paralelas) → reintento de la petición original → si el refresh falla,
  `tokenStore.clear()` y salida a `/login`.
- `features/auth/api/authApi.js`: `login()` y `register()`.
- `features/auth/queries/useSession.js`: contexto de sesión (`SessionProvider` + `useSession`)
  con el usuario conectado, sus **iniciales** y `signIn` / `signOut`.
- `features/auth/queries/useLogin.js` y `useRegister.js`: mutaciones de TanStack Query.
- **`/login`**: formulario nativo de email + contraseña. Vuelve a la ruta desde la que se llegó
  o al home.
- **`/registro`**: formulario nativo con los campos del yaml (`email`, `username`, `password`,
  `password2`, `first_name`, `last_name`). Errores del backend mostrados **por campo**.
- **AccountMenu** refleja el estado real: sin sesión, "Iniciar sesión" / "Crear cuenta"; con
  sesión, un **círculo con las iniciales** en el disparador y "Cerrar sesión" en el panel.

### No entra

- **Gating de rutas de cualquier tipo.** La tienda es 100 % pública: home, catálogo y ficha se
  navegan sin cuenta, antes y después de este spec. No se agrega ningún redirect a `/login` por
  entrar a una pantalla de la tienda.
- **`src/app/ProtectedRoute.jsx`.** Consecuencia directa de lo anterior: no hay una sola ruta
  privada, así que sería un componente sin consumidor. Se escribe en el spec que introduzca la
  primera pantalla privada (compras), son ~10 líneas. Lo que sí queda listo es lo que ese
  componente necesita: `useSession` y el redirect con la ruta de origen. Ver «Preguntas
  abiertas» 3.
- **Panel de administración.** El `/admin` lo sirve Django. Acá no se construye ninguna
  pantalla de gestión ni CRUD de `products`, `categories` o `roles`.
- **CRUD de usuarios ni edición de perfil.** No hay endpoints en el yaml y `CLAUDE.md` lo
  prohíbe explícitamente. El avatar no lleva a ninguna página de cuenta.
- **Foto de perfil.** El yaml no tiene ningún campo de imagen de usuario: el avatar son
  iniciales sobre un color fijo del tema.
- **Recuperar / cambiar contraseña.** No hay endpoint en el yaml.
- **"Recordarme", expiración proactiva, decodificar el JWT para leer su `exp`.** El token se
  usa hasta que el backend devuelve 401; ahí actúa el refresh. Un reloj en el cliente es una
  segunda fuente de verdad que se desincroniza.
- **Cookies `httpOnly`.** Las tendría que emitir Django y acá no se toca el backend
  (`SETUP.md` §7 ya documenta el riesgo y la salida).
- **Logout contra el backend.** El yaml no expone `blacklist`: cerrar sesión es local.
- **Conectar la tienda a la API** (home, catálogo, ficha): eso es el spec 002, que va después
  de este.

## 3. Contrato de la API

Base: `VITE_API_URL` = `http://localhost:8000/api/v1`. El yaml no declara `servers:` y sus
paths ya incluyen `/api/v1`.

| Método | Endpoint | Params / Body | Respuesta |
|---|---|---|---|
| POST | `/auth/login/` | `{ email, password }` | 200 · `{ access, refresh }` |
| POST | `/auth/refresh/` | `{ refresh }` | 200 · `{ access }` |
| POST | `/auth/register/` | `{ email, username, password, password2, first_name?, last_name? }` | 201 · `{ id, email, username, first_name, last_name, role }` |

Trampas del contrato relevantes acá:

- **Se entra con `email`, no con `username`.** `TokenObtainPair` pide `email` + `password`
  (ambos `writeOnly`) y devuelve `access` + `refresh` (ambos `readOnly`).
- **El login no devuelve nada del usuario.** Solo los dos tokens: ni nombre, ni id, ni rol.
- **No existe `GET /auth/me/`** ni ningún endpoint que devuelva el usuario actual. El único
  momento en que el backend manda `first_name` / `last_name` es la respuesta del **registro**.
  De ahí sale la degradación del avatar descrita en la tarea T7.
- **El refresh no rota el refresh token.** En `TokenRefresh`, `refresh` es `writeOnly` y
  `access` es `readOnly`: de la respuesta **solo llega `access`**. El `refresh` guardado no se
  toca.
- **`login` y `refresh` no declaran `security` y el yaml no tiene `security` global** → son
  públicos. `register` declara `[jwtAuth, {}]`: también público.
  → El `apiClient` **no** adjunta `Authorization` en ninguna ruta bajo `/auth/`.
- **Los `GET` de `/products/` y `/categories/` son públicos** (confirmado por el usuario; el
  yaml los marca `security: jwtAuth`, pero su `description` dice *"public read, staff write"* y
  manda la confirmación). El `apiClient` adjunta `Authorization` **solo si ya hay un token
  guardado**: la tienda funciona igual con sesión y sin ella. Esto cierra la pregunta abierta 1
  del spec 002.
- **`username` es obligatorio en el registro**, patrón `^[\w.@+-]+$`, máx. 150.
  `first_name` / `last_name` son **opcionales**, máx. 150. `email` máx. 254.
- **`password2` es obligatorio.** El yaml no declara longitud mínima ni reglas: la validación de
  fuerza es del backend. En el cliente solo se valida que las dos coincidan.
- **`id` y `role` son `readOnly`**: nunca se envían. `role` lo asigna el backend.
- **El yaml no declara ninguna respuesta de error** (ni 400 ni 401) para los tres endpoints. La
  forma de los errores está documentada en `SETUP.md` §7 (400 del registro por campo,
  `{ "email": ["..."] }`) pero **no está verificada contra la API**. Ver «Preguntas abiertas» 2:
  la UI degrada a un mensaje genérico cuando el cuerpo no tiene la forma esperada.

## 4. Archivos afectados

Todas las rutas están previstas en `SETUP.md` §6. **No se crea ninguna carpeta nueva.**

| Ruta | Acción | Responsabilidad |
|---|---|---|
| `src/lib/ApiError.js` | crear | `class ApiError extends Error` con `status` y `data` |
| `src/lib/tokenStore.js` | crear | Único módulo que lee/escribe las claves de sesión en `localStorage`: los dos tokens y el blob `ecommerce.user` |
| `src/lib/apiClient.js` | crear | Wrapper de `fetch`: base URL, params, `Authorization`, refresh deduplicado, `ApiError`, `null` en 204 |
| `src/app/queryClient.js` | crear | `QueryClient` con los `defaultOptions` de `SETUP.md` §7 |
| `src/main.jsx` | editar | Envolver el router en `QueryClientProvider` + `SessionProvider` |
| `src/features/auth/api/authApi.js` | crear | `login({email, password})`, `register(datos)`. Funciones async puras |
| `src/features/auth/queries/useSession.js` | crear | `SessionProvider` + `useSession()`: `user`, `initials`, `isAuthenticated`, `signIn`, `signOut` |
| `src/features/auth/queries/useLogin.js` | crear | `useMutation` sobre `login` + `signIn` en `onSuccess` |
| `src/features/auth/queries/useRegister.js` | crear | `useMutation` sobre `register`; guarda el perfil devuelto para el avatar |
| `src/features/auth/components/AuthField.jsx` | crear | `<label>` + `<input>` + error del backend para ese campo |
| `src/features/auth/pages/LoginPage.jsx` | crear | Ruta `/login`: formulario, error, redirect posterior |
| `src/features/auth/pages/RegisterPage.jsx` | crear | Ruta `/registro`: formulario, errores por campo |
| `src/app/router.jsx` | editar | Agregar `/login` y `/registro` dentro de `StoreLayout` |
| `src/components/layout/AccountMenu.jsx` | editar | Avatar de iniciales con sesión, menú anónimo sin ella; borrar el comentario de "las rutas no existen" |
| `docs/specs/002-conexion-api-tienda-publica.md` | editar | Marcar que T1–T5 las provee este spec y cerrar sus preguntas 1 y 2 |

Cuatro decisiones de estructura, para que no sorprendan en review:

1. **`SETUP.md` §6 lista `components/LoginForm.jsx` y `RegisterForm.jsx`; no se crean.** Cada
   formulario tiene un solo consumidor —su página— y partirlo es un archivo de indirección sin
   beneficio. Lo que sí se comparte entre los dos (el campo con su error) sale a `AuthField`.
2. **El refresh vive dentro de `apiClient.js`, no en `authApi.js`.** `SETUP.md` §6 prohíbe que
   `lib/` importe de `features/`, y `apiClient` es el único que refresca; ponerlo en `authApi`
   crea un ciclo `lib → features → lib`. `authApi` exporta `login` y `register`.
3. **El contexto de sesión vive en `queries/useSession.js`**, que es el archivo que `SETUP.md`
   §6 ya reserva para "sesión actual derivada del token". Es estado de cliente (`useState`), no
   una query: no hay endpoint que consultar.
4. **El avatar no es un componente nuevo.** Es un `<span>` redondo dentro de `AccountMenu`, su
   único consumidor, y las iniciales las calcula `useSession`. Cuando aparezca el segundo lugar
   que muestre identidad (el carrito, por ejemplo), se promueve a `components/ui/Avatar.jsx`
   —regla de dos de `SETUP.md` §6.

## 5. Tareas

- [x] **T1 — Error tipado de la API**
  - Archivo: `src/lib/ApiError.js`
  - Qué hace: `ApiError` con `status` y `data` (cuerpo parseado del backend) y un `message`
    legible tomado de `data.detail` cuando existe.
  - Hecho cuando: `new ApiError(401, { detail: 'x' })` es `instanceof Error` y expone
    `.status === 401` y `.data.detail === 'x'`.

- [x] **T2 — Almacén de sesión**
  - Archivo: `src/lib/tokenStore.js`
  - Qué hace: getters `access`, `refresh` y `user`; `save({ access, refresh, user })` que
    escribe solo las claves que recibe; `clear()` que borra las tres. Claves: las dos de
    `SETUP.md` §7 más `ecommerce.user`, un blob JSON `{ email, first_name, last_name }` (ver
    «Preguntas abiertas» 1). El getter `user` parsea con `try/catch` y devuelve `null` si el
    JSON está corrupto. Ningún otro módulo toca `localStorage`.
  - Hecho cuando: sin sesión los tres getters devuelven `null`; tras
    `save({ access: 'a', refresh: 'r', user: { email: 'e@e.com' } })` devuelven esos valores;
    tras `save({ access: 'b' })` el `refresh` y el `user` no cambian; tras `clear()` vuelven a
    `null`; con `ecommerce.user` seteado a mano en `"{"` el getter devuelve `null` sin lanzar.

- [x] **T3 — QueryClient**
  - Archivo: `src/app/queryClient.js`
  - Qué hace: exporta la instancia con los `defaultOptions` de `SETUP.md` §7 (`staleTime`
    60 s, sin retry ante 4xx, sin `refetchOnWindowFocus`).
  - Hecho cuando: una query que recibe 404 dispara una sola request; una que recibe 500
    reintenta hasta dos veces.

- [x] **T4 — Cliente HTTP**
  - Archivo: `src/lib/apiClient.js`
  - Qué hace: función que recibe `path` y opciones (`method`, `params`, `body`), prefija
    `import.meta.env.VITE_API_URL`, serializa `params` con `URLSearchParams` salteando
    `undefined` / `null` / `""` y mandando booleanos como `true`/`false`, manda
    `Content-Type: application/json` cuando hay `body`, adjunta
    `Authorization: Bearer <access>` **solo si hay token guardado y el path no empieza con
    `/auth/`**, devuelve `null` en 204 y lanza `ApiError` en cualquier respuesta no-ok.
  - Hecho cuando: `apiClient('/products/', { params: { page: 2, search: '' } })` pega a
    `.../products/?page=2`; sin sesión esa misma llamada sale sin cabecera `Authorization` y el
    backend responde 200; una llamada a `/auth/login/` con token guardado **no** lleva
    `Authorization`; un 404 llega como `ApiError` con `status: 404`.

- [x] **T5 — Refresco automático deduplicado**
  - Archivo: `src/lib/apiClient.js`
  - Qué hace: ante un 401 en un path que no sea `/auth/`, hace `POST /auth/refresh/` con
    `tokenStore.refresh`, guarda el `access` nuevo y reintenta la petición original **una sola
    vez**. Un módulo-scope `let refreshPromise` hace que N peticiones en 401 simultáneo
    compartan un único refresh. Si no hay `refresh` guardado o el refresh falla:
    `tokenStore.clear()` y salida a `/login` (salvo que ya se esté en `/login`).
  - Hecho cuando: con un `access` vencido, cinco peticiones lanzadas a la vez producen
    **exactamente una** request a `/auth/refresh/` en la pestaña Red y las cinco se resuelven
    con el token nuevo; con `refresh` inválido, se limpia `localStorage` y el navegador termina
    en `/login`, sin bucle de redirecciones.

- [x] **T6 — API de auth**
  - Archivo: `src/features/auth/api/authApi.js`
  - Qué hace: `login({ email, password })` → `POST /auth/login/`;
    `register({ email, username, password, password2, first_name, last_name })` →
    `POST /auth/register/`. Sin React, sin acceso a `tokenStore`.
  - Hecho cuando: `login` devuelve `{ access, refresh }` con credenciales válidas y propaga un
    `ApiError` con el status del backend cuando no lo son.

- [x] **T7 — Contexto de sesión e iniciales**
  - Archivo: `src/features/auth/queries/useSession.js`
  - Qué hace: `SessionProvider` con `useState` inicializado desde `tokenStore`, y `useSession()`
    que expone `{ user, initials, isAuthenticated, signIn({ access, refresh, user }), signOut() }`.
    `signIn` guarda en `tokenStore` y actualiza el estado; `signOut` hace `tokenStore.clear()`
    **y** `queryClient.clear()` (`SETUP.md` §7). `initials` se deriva del `user` guardado, en
    este orden y en mayúsculas:
    1. primera letra de `first_name` + primera de `last_name` (dos letras);
    2. si solo hay uno de los dos, su primera letra;
    3. primera letra de `username`;
    4. primera letra de `email`.
    Nunca devuelve vacío mientras haya sesión, porque `email` siempre está.
  - Hecho cuando: con `{ first_name: 'Juan', last_name: 'Díaz' }` devuelve `"JD"`; con solo
    `{ email: 'ana@x.com' }` devuelve `"A"`; tras un login, recargar la página mantiene
    `isAuthenticated === true`; tras `signOut()` queda en `false` y `localStorage` no conserva
    ninguna clave `ecommerce.*`.

- [x] **T8 — Montar los providers**
  - Archivo: `src/main.jsx`
  - Qué hace: envuelve `<RouterProvider>` en `<QueryClientProvider client={queryClient}>` y,
    dentro, en `<SessionProvider>`.
  - Hecho cuando: `npm run dev` levanta y ni `useQuery` ni `useSession` tiran error de
    provider ausente en ninguna ruta.

- [x] **T9 — Mutación de login**
  - Archivo: `src/features/auth/queries/useLogin.js`
  - Qué hace: `useMutation` sobre `login`; en `onSuccess` llama a `signIn` con los tokens y el
    usuario. Como el login **no devuelve nombre**, el `user` se arma así: si el blob
    `ecommerce.user` que ya está en el navegador tiene **el mismo `email`** que el que se acaba
    de usar, se conserva tal cual (mantiene `first_name`/`last_name` de un registro previo en
    ese navegador); si el email es distinto o no había blob, se guarda `{ email }` solo. Nunca
    se inventan nombres ni se arrastran los del usuario anterior.
  - Hecho cuando: un login exitoso deja los tokens en `localStorage` y `isAuthenticated` en
    `true` sin recargar; entrando con un email distinto al del blob guardado, el avatar pasa a
    mostrar la inicial del email nuevo y no las iniciales del usuario anterior.

- [x] **T10 — Mutación de registro**
  - Archivo: `src/features/auth/queries/useRegister.js`
  - Qué hace: `useMutation` sobre `register`. En `onSuccess` guarda **solo el perfil** con
    `tokenStore.save({ user: { email, first_name, last_name } })` a partir de la respuesta 201,
    para que el avatar tenga iniciales reales en el login siguiente. **No abre sesión**: no hay
    tokens que guardar (ver «Preguntas abiertas» 4).
  - Hecho cuando: un registro válido deja `ecommerce.user` con el nombre devuelto por el
    backend y `isAuthenticated` sigue en `false`; un email duplicado deja el `ApiError` 400
    disponible en `mutation.error` y no escribe nada en `localStorage`.

- [x] **T11 — Campo de formulario con error**
  - Archivo: `src/features/auth/components/AuthField.jsx`
  - Qué hace: `<label>` + `<input>` (props reenviadas al nativo) + `<p>` con el error del
    backend para ese campo; cuando hay error, `aria-invalid` y `aria-describedby` apuntando al
    mensaje.
  - Hecho cuando: pasándole `error="Ya existe un usuario con ese correo"`, un lector de
    pantalla anuncia el mensaje al enfocar el input.

- [x] **T12 — Página de login**
  - Archivo: `src/features/auth/pages/LoginPage.jsx`
  - Qué hace: `<form>` no controlado con `FormData`, `AuthField` de email
    (`type="email"`, `autoComplete="email"`, `required`) y contraseña
    (`type="password"`, `autoComplete="current-password"`, `required`), y un `Button` de
    `components/ui/`. Muestra el error del backend arriba del formulario.
  - Hecho cuando: con credenciales inválidas se ve el mensaje de error y la contraseña se puede
    reintentar sin recargar; con credenciales válidas la sesión queda abierta.

- [x] **T13 — Estado pendiente y redirect del login**
  - Archivo: `src/features/auth/pages/LoginPage.jsx`
  - Qué hace: el botón queda `disabled` mientras `isPending` y su texto pasa a "Ingresando…".
    Al terminar bien, `navigate(location.state?.from ?? '/', { replace: true })`. Si ya hay
    sesión al entrar a `/login`, redirige al home.
  - Hecho cuando: haciendo doble clic rápido en "Ingresar" se dispara una sola request; tras el
    login el botón "atrás" del navegador no vuelve al formulario.

- [x] **T14 — Página de registro**
  - Archivo: `src/features/auth/pages/RegisterPage.jsx`
  - Qué hace: `<form>` con los seis campos del yaml (`email`, `username` con
    `pattern="[\w.@+-]+"` y `maxLength=150`, `password`, `password2`, `first_name`,
    `last_name`; los dos nombres opcionales y omitidos del body si van vacíos). Botón
    deshabilitado mientras `isPending`.
  - Hecho cuando: enviar el formulario dispara `POST /auth/register/` con exactamente los
    campos completados y ninguno `readOnly` (`id`, `role`).

- [x] **T15 — Validación de contraseñas en el cliente**
  - Archivo: `src/features/auth/pages/RegisterPage.jsx`
  - Qué hace: `setCustomValidity` en `password2` para que el navegador bloquee el envío si no
    coincide con `password`, y lo limpie al corregir.
  - Hecho cuando: con contraseñas distintas el submit no llega a la red y el navegador muestra
    el aviso nativo sobre el campo.

- [x] **T16 — Errores del registro por campo**
  - Archivo: `src/features/auth/pages/RegisterPage.jsx`
  - Qué hace: mapea el cuerpo del `ApiError` 400 (`{ campo: ["mensaje"] }`) al `error` de cada
    `AuthField`; lo que no matchee un campo del formulario (`detail`, `non_field_errors` o un
    cuerpo con otra forma) se muestra en un aviso arriba.
  - Hecho cuando: registrarse con un email ya usado muestra el mensaje **debajo del campo
    email**, y un 500 sin cuerpo útil muestra el aviso genérico sin romper la página.

- [x] **T17 — Salida del registro**
  - Archivo: `src/features/auth/pages/RegisterPage.jsx`
  - Qué hace: tras un 201, `navigate('/login', { replace: true, state: { registered: true,
    email } })`; `LoginPage` muestra "Ya podés ingresar" y precarga el email
    (`defaultValue`).
  - Hecho cuando: un registro exitoso termina en `/login` con el aviso visible y el campo de
    email completo; al ingresar, el avatar muestra las iniciales del nombre que se registró.

- [x] **T18 — Rutas**
  - Archivo: `src/app/router.jsx`
  - Qué hace: agrega `{ path: 'login' }` y `{ path: 'registro' }` como hijas de `StoreLayout`.
    Ninguna de las rutas existentes cambia: siguen siendo públicas.
  - Hecho cuando: `/login` y `/registro` renderizan su página con el header y el footer de la
    tienda y ya no dan 404; `/`, `/catalogo` y `/productos/:id` se siguen viendo sin sesión.

- [x] **T19 — AccountMenu con avatar de iniciales**
  - Archivo: `src/components/layout/AccountMenu.jsx`
  - Qué hace: con `isAuthenticated`, el disparador reemplaza el `UserIcon` + "Cuenta" por un
    `<span>` circular (mismo tamaño que el icono actual) con las `initials` de `useSession`,
    fondo `bg-acc` y texto `text-bg`; el email va en el `title` del avatar y en el
    `aria-label` del botón (`Cuenta de ana@x.com`), no como texto visible. El panel abierto
    mantiene el email como encabezado accesible y ofrece **"Cerrar sesión"**, que llama a
    `signOut()` y navega al home. Sin sesión, queda el menú actual ("Iniciar sesión" / "Crear
    cuenta" + la nota de que se entra con el correo). Se borra el comentario de las rutas
    inexistentes.
  - Hecho cuando: entrar cambia el disparador a un círculo con iniciales sin recargar; el
    email no aparece como texto suelto en el header; "Cerrar sesión" devuelve el menú al estado
    anónimo y deja `localStorage` limpio; la `chevron` y el foco visible siguen funcionando
    igual en los dos estados.

- [x] **T20 — Ajustar el spec 002**
  - Archivo: `docs/specs/002-conexion-api-tienda-publica.md`
  - Qué hace: sus tareas T1–T5 y las filas correspondientes de la sección 4 se marcan como
    provistas por el spec 003. Sus preguntas abiertas 1 (lectura anónima) y 2 (refresh) **ya
    quedaron cerradas al redactar este spec**: solo resta el traspaso de T1–T5.
  - Hecho cuando: leyendo 002 aislado no queda ninguna instrucción de crear `apiClient`,
    `ApiError`, `tokenStore` ni `queryClient`, ni ninguna pregunta abierta sobre auth.

## 6. Criterios de aceptación

- [x] `npm run build` pasa sin errores.
- [x] `npm run lint` pasa sin errores nuevos.
- [x] No se agregaron dependencias a `package.json`.
- [x] No se creó ninguna carpeta fuera de la estructura de `SETUP.md`.
- [x] **Sin sesión se navegan `/`, `/catalogo` y `/productos/:id` completos**: ninguna ruta
      redirige a `/login` y no existe `ProtectedRoute.jsx` en el repo.
- [x] Ningún componente ni página llama a `fetch` ni importa `features/auth/api/`: el camino es
      página → `queries/` → `api/` → `apiClient`.
- [x] `localStorage` solo se toca desde `src/lib/tokenStore.js` (un grep de `localStorage` en
      `src/` devuelve únicamente ese archivo).
- [x] Login exitoso: la sesión persiste tras recargar (F5) y el disparador del menú muestra el
      círculo con iniciales.
- [x] Registrarse con nombre y después ingresar muestra dos letras en el avatar (`"JD"`);
      ingresar con una cuenta registrada en otro navegador muestra una sola letra (la del
      email). Ambos casos son correctos y están documentados.
- [x] El email no se muestra como texto en el header; sí está disponible en el `title` del
      avatar y en el `aria-label` del disparador.
- [x] Logout: `localStorage` queda sin claves `ecommerce.*` y el cache de TanStack Query se
      vacía.
- [x] Credenciales inválidas: se muestra un mensaje en español, el formulario sigue usable y no
      se guarda ningún token.
- [x] Registro con email o usuario ya existente: el mensaje del backend aparece **bajo el campo
      correspondiente**.
- [x] Contraseñas distintas: el submit no llega a la red.
- [x] Los botones de ambos formularios están `disabled` mientras la mutación está pendiente.
- [x] Con el `access` vencido y varias peticiones en paralelo, se dispara **una sola** request a
      `/auth/refresh/` y ninguna petición falla.
- [x] Con el `refresh` inválido, la sesión se limpia y el navegador termina en `/login`, sin
      bucle de redirecciones.
- [x] Las peticiones a `/auth/login/`, `/auth/refresh/` y `/auth/register/` no llevan cabecera
      `Authorization`.
- [x] El body del registro solo contiene campos del schema `Register` y ninguno `readOnly`.
- [x] `/login` y `/registro` funcionan desde el menú "Cuenta" en escritorio y en móvil.
- [x] No existe ninguna pantalla de administración ni de gestión de usuarios en `src/`.

## 7. Preguntas abiertas

Ninguna es bloqueante: las cuatro tienen default y el spec se puede aprobar tal cual.

1. **Qué se guarda para dibujar el avatar.** No hay `GET /auth/me/` y el `access` de SimpleJWT
   no garantiza traer el email en sus claims (por defecto solo lleva `user_id`), así que la
   identidad visible tiene que persistirse en el cliente. **Default:** un único blob JSON en
   `localStorage` bajo `ecommerce.user` con `{ email, first_name, last_name }`, escrito y leído
   solo por `tokenStore`. Un blob y no tres claves sueltas: se guarda, se limpia y se migra a
   cookies el día que el backend lo permita en una sola operación.
   - **Implica agregar una tercera clave a `SETUP.md` §7**, que hoy documenta solo
     `ecommerce.access` y `ecommerce.refresh`. Es una línea en ese documento; se actualiza al
     implementar (o se descarta el avatar con nombre si preferís no tocarlo).
   - **Degradación conocida y aceptada:** el nombre solo existe si el registro se hizo en **ese
     mismo navegador**. Tras un login "limpio" (otro dispositivo, `localStorage` borrado, o un
     email distinto al del blob), el avatar muestra la inicial del email. No hay forma de
     mejorarlo sin un endpoint de perfil en el backend, y acá no se toca el backend.
   - **Alternativa si preferís cero clave nueva:** el avatar usa siempre la inicial del email y
     `tokenStore` guarda solo el email. Se pierden las dos letras tras el registro.
2. **Forma del error de credenciales inválidas.** El yaml no declara respuestas de error. Lo
   esperable de SimpleJWT es 401 con `{ "detail": "No active account found with the given
   credentials" }`, en inglés. **Default:** si el cuerpo trae `detail`, se muestra un texto
   propio en español ("Correo o contraseña incorrectos") en vez de reenviar el inglés del
   backend; para el resto de errores se muestra "No pudimos conectarnos. Probá de nuevo". No se
   pudo verificar contra la API (no responde en `http://localhost:8000`).
3. **¿Hay algo que proteger hoy?** No: la tienda entera es pública y no se construye admin.
   **Default:** no se crea `ProtectedRoute.jsx`; llega con la feature de compras, que es la que
   traerá la primera pantalla privada (checkout, pedidos). Si querés que exista igual porque
   `SETUP.md` lo lista, es una tarea de tres líneas — pero quedaría sin un solo consumidor.
4. **¿El registro loguea automáticamente?** `POST /auth/register/` devuelve el usuario, **no
   tokens**: auto-loguear obliga a encadenar un segundo `POST /auth/login/` y a manejar el caso
   "registro OK, login falló". **Default:** el registro redirige a `/login` con el email
   precargado y un aviso; el perfil (nombre) ya quedó guardado, así que el avatar sale bien al
   primer ingreso. Si preferís el auto-login, es una tarea extra en `useRegister`.
