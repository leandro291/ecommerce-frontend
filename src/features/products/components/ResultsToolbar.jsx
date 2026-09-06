import ActiveFilters from "./ActiveFilters"

// `total` = cantidad de resultados. `filters` alimenta los chips de filtros
// activos y `onRemoveFilter` los quita. Las opciones del <select> son los
// valores que la API acepta en `?ordering=`.
export default function ResultsToolbar({
  total,
  filters = [],
  onRemoveFilter,
  ordering,
  onOrderingChange,
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-4">
      <span className="text-[15px] text-muted">{total} resultados</span>
      <div className="grow">
        <ActiveFilters filters={filters} onRemove={onRemoveFilter} />
      </div>
      <label htmlFor="orden" className="sr-only">
        Ordenar resultados
      </label>
      <select
        id="orden"
        name="ordering"
        value={ordering}
        onChange={(event) => onOrderingChange(event.target.value)}
        className="h-11 cursor-pointer rounded-full border border-line-2 bg-surface-2 px-4 text-sm text-fg-soft focus-visible:border-acc focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acc"
      >
        <option value="-created_at">Más recientes</option>
        <option value="price">Precio: de menor a mayor</option>
        <option value="-price">Precio: de mayor a menor</option>
        <option value="name">Nombre: A-Z</option>
      </select>
    </div>
  )
}
