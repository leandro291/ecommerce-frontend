// Fila de chips de categoría para el catálogo en móvil. Markup puro: no hay
// estado de selección real todavía (lo engancha el spec 002). "Todo" queda
// como activo por defecto.
const CHIP =
  "shrink-0 rounded-full border px-4 py-2.5 text-sm font-medium transition"
const ACTIVE = "border-acc bg-acc text-bg"
const IDLE = "border-line-2 bg-transparent text-muted hover:text-fg"

export default function CategoryChips({ categories }) {
  return (
    <div className="flex flex-wrap gap-2.5">
      <button type="button" className={`${CHIP} ${ACTIVE}`}>
        Todo
      </button>
      {categories.map((category) => (
        <button key={category.id} type="button" className={`${CHIP} ${IDLE}`}>
          {category.name}
        </button>
      ))}
    </div>
  )
}
