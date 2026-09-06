const BASE =
  "inline-block rounded-md bg-acc px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-bg"

// `nuevo` -> "Novedad" en el hero / galería. `stock` -> "Últimas N unidades"
// cuando el producto tiene stock 1..5. Misma pastilla, distinto significado.
export default function Badge({ variant = "nuevo", className = "", children }) {
  const text = children ?? (variant === "nuevo" ? "Novedad" : null)
  return <span className={`${BASE} ${className}`}>{text}</span>
}
