import { Link } from "react-router"
import Button from "../../../components/ui/Button"
import FeaturedProduct from "./FeaturedProduct"
import { ArrowRightIcon } from "../../../components/ui/icons"

// Bloque de marketing del landing. Textos fijos; la bajada entre corchetes es
// un placeholder a reemplazar. `featured` es el producto de muestra destacado.
export default function Hero({ featured }) {
  return (
    <section className="mx-auto grid max-w-[1280px] items-center gap-8 px-5 pb-12 pt-10 md:grid-cols-12 md:px-10 md:pb-24 md:pt-[72px]">
      <div className="md:col-span-7">
        <span className="mb-4 block font-display text-[11px] font-medium uppercase tracking-[0.16em] text-acc md:mb-6 md:text-xs">
          Tienda en línea
        </span>
        <h1 className="mb-4 text-4xl font-bold uppercase leading-[0.98] -tracking-[0.038em] md:mb-6 md:text-[76px]">
          Todo el catálogo en un solo lugar
        </h1>
        <p className="mb-7 max-w-[480px] text-[15px] leading-relaxed text-muted md:mb-10 md:text-[17px]">
          [Una línea sobre qué vende tu tienda y para quién.]
        </p>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-3.5">
          <Button as={Link} to="/catalogo">
            Ver el catálogo
            <ArrowRightIcon className="h-[18px] w-[18px]" />
          </Button>
          <Button as="a" href="/#categorias" variant="ghost">
            Explorar categorías
          </Button>
        </div>
      </div>

      <div className="md:col-span-5">
        <FeaturedProduct product={featured} />
      </div>
    </section>
  )
}
