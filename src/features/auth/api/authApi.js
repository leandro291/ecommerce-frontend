import { apiClient } from "../../../lib/apiClient"

// Se entra con el correo, no con el usuario. Devuelve { access, refresh }.
export function login({ email, password }) {
  return apiClient("/auth/login/", {
    method: "POST",
    body: { email, password },
  })
}

// `id` y `role` son readOnly: los asigna el backend y nunca se envían.
export function register(data) {
  return apiClient("/auth/register/", { method: "POST", body: data })
}
