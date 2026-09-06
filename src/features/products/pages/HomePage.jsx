import { Link } from "react-router"
import CategoryGrid from "../../categories/components/CategoryGrid"
import Hero from "../components/Hero"
import ProductGrid from "../components/ProductGrid"
import Button from "../../../components/ui/Button"
import EmptyState from "../../../components/ui/EmptyState"
import QueryState from "../../../components/ui/QueryState"
import { useCategories } from "../../categories/queries/useCategories"
import { useProducts } from "../queries/useProducts"

// La API no expone `page_size`: se pide la página 1 y se recorta acá.
const LANDING_ITEMS = 6

export default function HomePage() {
  const categories = useCategories({ is_active: true, ordering: "name" })
  const products = useProducts({ is_active: true, ordering: "-created_at" })

  const categoryList = categories.data?.results.slice(0, LANDING_ITEMS) ?? []
  const productList = products.data?.results.slice(0, LANDING_ITEMS) ?? []

  const categoriesState = {
    isPending: categories.isPending,
    isError: categories.isError,
    error: categories.error,
    onRetry: () => categories.refetch(),
    loadingTitle: "Cargando categorías…",
  }
  const productsState = {
    isPending: products.isPending,
    isError: products.isError,
    error: products.error,
    onRetry: () => products.refetch(),
    loadingTitle: "Cargando productos…",
  }
  const noProducts = (
    <EmptyState
      title="Todavía no hay productos"
      description="En cuanto se publique el primero aparece acá."
    />
  )

  return (
    <>
      <Hero
        featured={productList[0]}
        fallback={<QueryState {...productsState}>{noProducts}</QueryState>}
      />
      <CategoryGrid
        categories={categoryList}
        fallback={
          categoryList.length === 0 ? (
            <QueryState {...categoriesState}>
              <EmptyState
                title="Todavía no hay categorías"
                description="En cuanto se publique la primera aparece acá."
              />
            </QueryState>
          ) : null
        }
      />

      <section
        id="novedades"
        className="mx-auto max-w-[1280px] px-5 pb-10 md:px-10"
      >
        <div className="mb-6 flex items-end justify-between md:mb-8">
          <div>
            <span className="mb-3 block font-display text-xs font-medium uppercase tracking-[0.16em] text-acc">
              Novedades
            </span>
            <h2 className="text-3xl font-bold uppercase leading-tight -tracking-[0.03em] md:text-[40px]">
              Lo último que entró
            </h2>
          </div>
          <span className="hidden pb-2 text-sm text-faint md:block">
            Ordenado por fecha de alta
          </span>
        </div>

        <QueryState {...productsState}>
          {productList.length > 0 ? (
            <ProductGrid products={productList} />
          ) : (
            noProducts
          )}
        </QueryState>

        {/* Texto genérico a propósito: la maqueta hardcodea el conteo
            ("Ver los 9 productos"); acá no se ata a los datos. */}
        <div className="flex justify-center pt-11">
          <Button as={Link} to="/catalogo" variant="ghost">
            Ver todo el catálogo
          </Button>
        </div>
      </section>
    </>
  )
}
