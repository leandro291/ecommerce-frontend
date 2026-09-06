import { Link, useParams } from "react-router"
import Breadcrumbs from "../../../components/ui/Breadcrumbs"
import Button from "../../../components/ui/Button"
import EmptyState from "../../../components/ui/EmptyState"
import QueryState from "../../../components/ui/QueryState"
import { ArrowRightIcon } from "../../../components/ui/icons"
import ProductGallery from "../components/ProductGallery"
import ProductInfo from "../components/ProductInfo"
import ProductMeta from "../components/ProductMeta"
import ProductActions from "../components/ProductActions"
import ProductGrid from "../components/ProductGrid"
import { useProduct } from "../queries/useProduct"
import { useProducts } from "../queries/useProducts"

const PAGE = "mx-auto max-w-[1280px] px-5 pb-20 pt-7 md:px-10"
const RELATED_ITEMS = 3

export default function ProductDetailPage() {
  const { id } = useParams()
  const productQuery = useProduct(id)
  const product = productQuery.data

  // Los relacionados esperan a saber la categoría del producto.
  const relatedQuery = useProducts(
    { is_active: true, category: product?.category.id },
    { enabled: Boolean(product) },
  )
  const related = (relatedQuery.data?.results ?? [])
    .filter((item) => item.id !== product?.id)
    .slice(0, RELATED_ITEMS)

  if (!product) {
    return (
      <div className={PAGE}>
        {productQuery.error?.status === 404 ? (
          <EmptyState
            title="No encontramos ese producto"
            description="Puede que ya no esté publicado o que el enlace esté mal."
            action={
              <Button as={Link} to="/catalogo">
                Volver al catálogo
              </Button>
            }
          />
        ) : (
          <QueryState
            isPending={productQuery.isPending}
            isError={productQuery.isError}
            error={productQuery.error}
            onRetry={() => productQuery.refetch()}
            loadingTitle="Cargando producto…"
          />
        )}
      </div>
    )
  }

  return (
    <div className={PAGE}>
      <Breadcrumbs
        items={[
          { label: "Inicio", to: "/" },
          { label: "Catálogo", to: "/catalogo" },
          {
            label: product.category.name,
            to: `/catalogo?category=${product.category.id}`,
          },
          { label: product.name },
        ]}
      />

      <section className="mt-8 grid gap-11 md:grid-cols-12 md:items-start">
        <div className="md:col-span-7">
          <ProductGallery />
        </div>
        <div className="md:col-span-5">
          <ProductInfo product={product} />
          <ProductMeta product={product} />
          <ProductActions />
        </div>
      </section>

      {/* `isPlaceholderData`: al saltar de un producto a otro, los relacionados
          del anterior no se muestran bajo el título de la categoría nueva. */}
      {related.length > 0 && !relatedQuery.isPlaceholderData && (
        <section className="mt-4">
          <div className="mb-7 flex items-end justify-between">
            <h2 className="text-2xl font-bold uppercase leading-tight -tracking-[0.03em] md:text-[32px]">
              Más de {product.category.name}
            </h2>
            <Link
              to={`/catalogo?category=${product.category.id}`}
              className="flex items-center gap-2 pb-1 text-[15px] font-medium text-muted transition hover:text-fg"
            >
              Ver la categoría
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  )
}
