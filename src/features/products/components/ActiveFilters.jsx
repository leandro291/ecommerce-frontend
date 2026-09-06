import { CloseIcon } from "../../../components/ui/icons"

// filters: [{ label }]. La "x" es decorativa (el spec 002 la conecta).
export default function ActiveFilters({ filters }) {
  if (!filters.length) return null
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => (
        <span
          key={filter.label}
          className="flex items-center gap-2 rounded-full border border-line-2 px-3.5 py-2 text-[13px] text-fg-soft"
        >
          {filter.label}
          <CloseIcon className="h-3 w-3 text-muted" aria-hidden="true" />
        </span>
      ))}
    </div>
  )
}
