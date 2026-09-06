// Fila de chips de categoría para el catálogo en móvil. `activeId` es el id de
// la categoría filtrada (string de la URL o null) y `onSelect` recibe el id
// elegido, o null para "Todo".
const CHIP =
  "shrink-0 rounded-full border px-4 py-2.5 text-sm font-medium transition"
const ACTIVE = "border-acc bg-acc text-bg"
const IDLE = "border-line-2 bg-transparent text-muted hover:text-fg"

export default function CategoryChips({ categories, activeId, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2.5">
      <button
        type="button"
        onClick={() => onSelect(null)}
        aria-pressed={!activeId}
        className={`${CHIP} ${activeId ? IDLE : ACTIVE}`}
      >
        Todo
      </button>
      {categories.map((category) => {
        const isActive = String(activeId) === String(category.id)
        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelect(category.id)}
            aria-pressed={isActive}
            className={`${CHIP} ${isActive ? ACTIVE : IDLE}`}
          >
            {category.name}
          </button>
        )
      })}
    </div>
  )
}
