import { CloseIcon, SearchIcon } from "../../../components/ui/icons"

const SECTION_LABEL =
  "mb-3 block text-xs uppercase tracking-[0.12em] text-faint"
const FIELD =
  "h-12 w-full rounded-[11px] border border-line-2 bg-surface-2 px-3.5 text-[15px] text-fg placeholder:text-faint-2 focus-visible:border-acc focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acc"

// Filtros que acepta `GET /products/`: search, category (uno, id), price_min,
// price_max, in_stock. Todo markup: inputs no controlados, sin handlers.
// El spec 002 los conecta a la URL y a la query.
export default function FilterSidebar({ categories }) {
  return (
    <aside className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold uppercase -tracking-[0.02em]">Filtros</h2>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-full border border-line-2 px-3 py-1.5 text-[13px] text-muted transition hover:border-acc hover:text-acc"
        >
          <CloseIcon className="h-3 w-3" />
          Limpiar
        </button>
      </div>

      <div>
        <label htmlFor="filtro-busqueda" className={SECTION_LABEL}>
          Búsqueda
        </label>
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-4 top-[15px] h-[18px] w-[18px] text-faint-2" />
          <input
            id="filtro-busqueda"
            type="search"
            name="search"
            placeholder="Buscar producto"
            className={`${FIELD} pl-11`}
          />
        </div>
      </div>

      <div className="h-px bg-surface" />

      <div>
        <span className={SECTION_LABEL}>Categoría</span>
        <div className="flex flex-col gap-1">
          <label className="flex cursor-pointer items-center gap-3 py-2 text-[15px] text-fg-soft">
            <input
              type="radio"
              name="category"
              value=""
              defaultChecked
              className="h-4 w-4 accent-acc"
            />
            Todas
          </label>
          {categories.map((category) => (
            <label
              key={category.id}
              className="flex cursor-pointer items-center gap-3 py-2 text-[15px] text-fg-soft"
            >
              <input
                type="radio"
                name="category"
                value={category.id}
                className="h-4 w-4 accent-acc"
              />
              {category.name}
            </label>
          ))}
        </div>
        <p className="mt-3 text-xs leading-relaxed text-faint-2">
          La API filtra por una categoría a la vez (
          <span className="text-muted">?category=id</span>).
        </p>
      </div>

      <div className="h-px bg-surface" />

      <div>
        <span className={SECTION_LABEL}>Precio (S/)</span>
        <div className="grid grid-cols-2 gap-2.5">
          <label className="contents">
            <span className="sr-only">Precio mínimo</span>
            <input
              type="number"
              name="price_min"
              min="0"
              placeholder="Mín."
              className={FIELD}
            />
          </label>
          <label className="contents">
            <span className="sr-only">Precio máximo</span>
            <input
              type="number"
              name="price_max"
              min="0"
              placeholder="Máx."
              className={FIELD}
            />
          </label>
        </div>
      </div>

      <div className="h-px bg-surface" />

      <div>
        <span className={SECTION_LABEL}>Disponibilidad</span>
        <label className="flex cursor-pointer items-center justify-between gap-3.5 py-1 text-[15px] text-fg-soft">
          Solo con stock
          <span className="relative inline-flex h-6 w-11 shrink-0 items-center">
            <input
              type="checkbox"
              name="in_stock"
              className="peer h-6 w-11 appearance-none rounded-full bg-line-2 transition-colors checked:bg-acc focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acc focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            />
            <span className="pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-fg shadow transition-transform peer-checked:translate-x-5 peer-checked:bg-bg" />
          </span>
        </label>
      </div>
    </aside>
  )
}
