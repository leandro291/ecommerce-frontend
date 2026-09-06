// Error tipado de la API: conserva el status HTTP y el cuerpo parseado del
// backend para que la UI pueda decidir qué mostrar (mensaje por campo, 404, etc).
export class ApiError extends Error {
  constructor(status, data) {
    super(data?.detail ?? `La API respondió ${status}`)
    this.name = "ApiError"
    this.status = status
    this.data = data ?? null
  }
}
