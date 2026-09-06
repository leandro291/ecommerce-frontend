// Único módulo que lee y escribe las claves de sesión en localStorage.
// Nadie más toca localStorage: migrar a cookies httpOnly es cambiar este archivo.
const ACCESS = "ecommerce.access"
const REFRESH = "ecommerce.refresh"
// Identidad visible del usuario (para el avatar). El login no devuelve nada del
// usuario y no hay GET /auth/me/, así que se persiste en el cliente.
const USER = "ecommerce.user"

export const tokenStore = {
  get access() {
    return localStorage.getItem(ACCESS)
  },
  get refresh() {
    return localStorage.getItem(REFRESH)
  },
  get user() {
    const raw = localStorage.getItem(USER)
    if (!raw) return null
    try {
      return JSON.parse(raw)
    } catch {
      return null
    }
  },
  // Guarda solo las claves que recibe: save({ access }) no pisa refresh ni user.
  save({ access, refresh, user } = {}) {
    if (access) localStorage.setItem(ACCESS, access)
    if (refresh) localStorage.setItem(REFRESH, refresh)
    if (user) localStorage.setItem(USER, JSON.stringify(user))
  },
  clear() {
    localStorage.removeItem(ACCESS)
    localStorage.removeItem(REFRESH)
    localStorage.removeItem(USER)
  },
}
