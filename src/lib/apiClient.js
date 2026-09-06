import { ApiError } from "./ApiError"
import { tokenStore } from "./tokenStore"

const BASE_URL = import.meta.env.VITE_API_URL

// Los endpoints de auth/ son públicos: nunca llevan Authorization.
const isAuthPath = (path) => path.startsWith("/auth/")

function buildUrl(path, params) {
  const url = `${BASE_URL}${path}`
  if (!params) return url
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue
    search.set(key, String(value)) // los booleanos viajan como true/false
  }
  const query = search.toString()
  return query ? `${url}?${query}` : url
}

async function parseBody(response) {
  try {
    return await response.json()
  } catch {
    return null
  }
}

// Un solo refresh en vuelo: si llegan cinco 401 en paralelo, las cinco esperan
// la misma promesa en vez de quemar el refresh token cuatro veces.
let refreshPromise = null
// Con N peticiones muertas se redirige una sola vez, no N.
let redirecting = false

async function doRefresh() {
  const refresh = tokenStore.refresh
  if (!refresh) throw new ApiError(401, { detail: "No hay sesión que refrescar" })

  const response = await fetch(`${BASE_URL}/auth/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  })
  if (!response.ok) throw new ApiError(response.status, await parseBody(response))

  // TokenRefresh solo devuelve `access`: el refresh guardado no se toca.
  const { access } = await response.json()
  tokenStore.save({ access })
  return access
}

function refreshAccess() {
  refreshPromise ??= doRefresh().finally(() => {
    refreshPromise = null
  })
  return refreshPromise
}

function endSession() {
  tokenStore.clear()
  if (redirecting || window.location.pathname === "/login") return
  redirecting = true
  window.location.assign("/login")
}

export async function apiClient(path, { method = "GET", params, body } = {}) {
  const url = buildUrl(path, params)

  const send = () => {
    const headers = {}
    if (body !== undefined) headers["Content-Type"] = "application/json"
    const access = tokenStore.access
    if (access && !isAuthPath(path)) headers.Authorization = `Bearer ${access}`
    return fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  }

  let response = await send()

  if (response.status === 401 && !isAuthPath(path)) {
    try {
      await refreshAccess()
    } catch {
      endSession()
      throw new ApiError(401, await parseBody(response))
    }
    response = await send() // un único reintento con el access nuevo
  }

  if (response.status === 204) return null // los DELETE responden sin cuerpo
  if (!response.ok) throw new ApiError(response.status, await parseBody(response))
  return parseBody(response) // un 200 con cuerpo vacío devuelve null, no un SyntaxError
}
