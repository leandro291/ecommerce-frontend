import { Link } from "react-router"
import CategoryCard from "./CategoryCard"
import { ArrowRightIcon } from "../../../components/ui/icons"

export default function CategoryGrid({ categories }) {
  return (
    <section
      id="categorias"
      className="mx-auto max-w-[1280px] px-5 pb-16 md:px-10 md:pb-24"
    >
      <div className="mb-6 flex items-end justify-between md:mb-8">
        <div>
          <span className="mb-3 block font-display text-xs font-medium uppercase tracking-[0.16em] text-acc">
            Categorías
          </span>
          <h2 className="text-3xl font-bold uppercase leading-tight -tracking-[0.03em] md:text-[40px]">
            Elegí por dónde empezar
          </h2>
        </div>
        <Link
          to="/catalogo"
          className="hidden items-center gap-2 pb-1.5 text-[15px] font-medium text-muted transition hover:text-fg md:flex"
        >
          Ir al catálogo
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </section>
  )
}
