const shortDate = new Intl.DateTimeFormat("es-PE", {
  day: "numeric",
  month: "short",
  year: "numeric",
})

// Recibe un ISO string (`created_at` / `updated_at` de la API) y devuelve
// una fecha corta legible. Entrada vacía o inválida => "—".
export function formatDate(isoString) {
  if (!isoString) return "—"
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return "—"
  return shortDate.format(date)
}
