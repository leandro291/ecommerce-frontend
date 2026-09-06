import { CloseIcon } from "../../../components/ui/icons"

// filters: [{ key, label }], donde `key` es el query param que se quita.
export default function ActiveFilters({ filters, onRemove }) {
  if (!filters.length) return null
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => (
        <span
          key={filter.key}
          className="flex items-center gap-2 rounded-full border border-line-2 px-3.5 py-2 text-[13px] text-fg-soft"
        >
          {filter.label}
          <button
            type="button"
            onClick={() => onRemove(filter.key)}
            aria-label={`Quitar filtro ${filter.label}`}
            className="rounded-full text-muted transition hover:text-acc focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acc"
          >
            <CloseIcon className="h-3 w-3" />
          </button>
        </span>
      ))}
    </div>
  )
}
