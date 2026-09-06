import ActiveFilters from "./ActiveFilters"

// `total` = cantidad de resultados. `filters` alimenta los chips de filtros
// activos. El <select> usa los nombres de campo reales de la API para que el
// spec 002 los mande tal cual como `?ordering=`. Sin onChange todavía.
export default function ResultsToolbar({ total, filters = [] }) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-4">
      <span className="text-[15px] text-muted">{total} resultados</span>
      <div className="grow">
        <ActiveFilters filters={filters} />
      </div>
      <label htmlFor="orden" className="sr-only">
        Ordenar resultados
      </label>
      <select
        id="orden"
        name="ordering"
        defaultValue="-created_at"
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
