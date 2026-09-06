// Texto legible del stock de un producto. Única fuente de los umbrales y de
// las tres plantillas:
//   0      -> "Sin stock"
//   1..5   -> "Últimas N unidades"
//   > 5    -> "N disponibles"
export function stockLabel(stock) {
  if (stock === 0) return "Sin stock"
  if (stock <= 5) return `Últimas ${stock} unidades`
  return `${stock} disponibles`
}
