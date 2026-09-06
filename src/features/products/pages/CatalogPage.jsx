import { useSearchParams } from "react-router"
import Breadcrumbs from "../../../components/ui/Breadcrumbs"
import Button from "../../../components/ui/Button"
import EmptyState from "../../../components/ui/EmptyState"
import QueryState from "../../../components/ui/QueryState"
import { ArrowRightIcon } from "../../../components/ui/icons"
import CategoryChips from "../../categories/components/CategoryChips"
import { useCategories } from "../../categories/queries/useCategories"
import FilterSidebar from "../components/FilterSidebar"
import ProductGrid from "../components/ProductGrid"
import ResultsToolbar from "../components/ResultsToolbar"
import { useProducts } from "../queries/useProducts"
import { formatPrice } from "../../../utils/formatPrice"

const DEFAULT_ORDERING = "-created_at"
const PAGE_BUTTON =
  "flex h-11 w-11 items-center justify-center rounded-full border border-line-2 text-fg-soft transition hover:border-acc hover:text-acc focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acc disabled:cursor-not-allowed disabled:border-line-2 disabled:text-line-hover disabled:hover:border-line-2"

export default function CatalogPage() {
  // La URL es el único estado de los filtros: compartir el link reproduce la
  // búsqueda y "atrás" del navegador funciona solo.
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get("search") ?? ""
  const category = searchParams.get("category") ?? ""
  const priceMin = searchParams.get("price_min") ?? ""
  const priceMax = searchParams.get("price_max") ?? ""
  const inStock = searchParams.get("in_stock") ?? ""
  const ordering = searchParams.get("ordering") ?? DEFAULT_ORDERING
  const page = Number(searchParams.get("page")) || 1

  const applyFilters = (patch) => {
    const next = new URLSearchParams(searchParams)
    for (const [key, value] of Object.entries(patch)) {
      if (value === null || value === undefined || value === "") next.delete(key)
      else next.set(key, String(value))
    }
    // Nada cambió: salir de un campo sin tocarlo no resetea la página ni
    // ensucia el historial con una entrada idéntica. Va antes del delete de
    // `page`, si no ese borrado hace que los strings difieran siempre.
    if (next.toString() === searchParams.toString()) return
    // Cambiar cualquier filtro u orden vuelve a la primera página.
    if (!("page" in patch)) next.delete("page")
    setSearchParams(next)
  }
  const clearFilters = () => setSearchParams(new URLSearchParams())

  // La tienda pública solo muestra lo publicado. Los vacíos no se mandan.
  const products = useProducts({
    is_active: true,
    ordering,
    page,
    search: search || undefined,
    category: category || undefined,
    price_min: priceMin || undefined,
    price_max: priceMax || undefined,
    in_stock: inStock || undefined,
  })
  const categories = useCategories({ is_active: true, ordering: "name" })

  const categoryList = categories.data?.results ?? []
  const results = products.data?.results ?? []
  const count = products.data?.count ?? 0

  const categoryName = categoryList.find(
    (item) => String(item.id) === category,
  )?.name
  const activeFilters = [
    search && { key: "search", label: `Búsqueda: ${search}` },
    category && { key: "category", label: categoryName ?? `Categoría ${category}` },
    priceMin && { key: "price_min", label: `Desde ${formatPrice(priceMin)}` },
    priceMax && { key: "price_max", label: `Hasta ${formatPrice(priceMax)}` },
    inStock === "true" && { key: "in_stock", label: "Solo con stock" },
  ].filter(Boolean)

  return (
    <div className="mx-auto max-w-[1360px] px-5 py-10 md:px-10 md:pb-20">
      <Breadcrumbs
        items={[{ label: "Inicio", to: "/" }, { label: "Catálogo" }]}
      />

      <h1 className="mb-6 mt-6 text-4xl font-bold uppercase leading-none -tracking-[0.035em] md:text-[52px]">
        Catálogo
      </h1>

      <div className="md:grid md:grid-cols-[280px_minmax(0,1fr)] md:items-start md:gap-10">
        <div className="mb-8 md:hidden">
          <CategoryChips
            categories={categoryList}
            activeId={category}
            onSelect={(id) => applyFilters({ category: id })}
          />
        </div>
        <div className="hidden md:block">
          <FilterSidebar
            categories={categoryList}
            values={{
              search,
              category,
              price_min: priceMin,
              price_max: priceMax,
              in_stock: inStock,
            }}
            onApply={applyFilters}
            onClear={clearFilters}
          />
        </div>

        <div>
          <ResultsToolbar
            total={count}
            filters={activeFilters}
            onRemoveFilter={(key) => applyFilters({ [key]: "" })}
            ordering={ordering}
            onOrderingChange={(value) => applyFilters({ ordering: value })}
          />

          <QueryState
            isPending={products.isPending}
            isError={products.isError}
            error={products.error}
            onRetry={() => products.refetch()}
            loadingTitle="Cargando productos…"
          >
            {results.length > 0 ? (
              <ProductGrid products={results} />
            ) : (
              <EmptyState
                title="Ningún producto coincide"
                description="Probá con menos filtros o revisá la búsqueda."
                action={<Button onClick={clearFilters}>Limpiar filtros</Button>}
              />
            )}
          </QueryState>

          {/* La API no devuelve el total de páginas: las flechas se habilitan
              con `next` / `previous` y el pill muestra la página actual. */}
          {count > 0 && (
            <div className="mt-9 flex items-center justify-between">
              <span className="text-sm text-faint">{count} resultados</span>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  aria-label="Página anterior"
                  disabled={!products.data?.previous}
                  aria-disabled={!products.data?.previous}
                  onClick={() =>
                    applyFilters({ page: page - 1 > 1 ? page - 1 : "" })
                  }
                  className={PAGE_BUTTON}
                >
                  <ArrowRightIcon className="h-4 w-4 rotate-180" />
                </button>
                <span
                  aria-current="page"
                  className="flex h-11 min-w-11 items-center justify-center rounded-full border border-acc bg-acc px-1 text-[15px] font-semibold text-bg"
                >
                  {page}
                </span>
                <button
                  type="button"
                  aria-label="Página siguiente"
                  disabled={!products.data?.next}
                  aria-disabled={!products.data?.next}
                  onClick={() => applyFilters({ page: page + 1 })}
                  className={PAGE_BUTTON}
                >
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
