const soles = new Intl.NumberFormat("es-PE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

// `price` llega como string decimal desde la API (p. ej. "1299.00").
// Nunca se hace aritmética con el valor: solo se formatea para mostrar.
export function formatPrice(priceString) {
  const value = Number(priceString)
  if (priceString === "" || priceString == null || Number.isNaN(value)) return ""
  return `S/ ${soles.format(value)}`
}
