import { formatPrice } from "../../../utils/formatPrice"

// `product` con forma `ProductRead`: `category` es objeto anidado.
export default function ProductInfo({ product }) {
  return (
    <div>
      <span className="mb-3.5 block text-xs uppercase tracking-[0.12em] text-faint">
        {product.category.name}
      </span>
      <h1 className="mb-5 text-3xl font-bold uppercase leading-[1.06] -tracking-[0.032em] md:text-[40px]">
        {product.name}
      </h1>
      <p className="mb-7 text-base leading-relaxed text-muted">
        {product.description}
      </p>
      <div className="mb-7 flex items-baseline gap-3.5">
        <span className="font-display text-4xl font-bold -tracking-[0.03em] md:text-[44px]">
          {formatPrice(product.price)}
        </span>
        <span className="text-sm text-faint">IGV incluido</span>
      </div>
    </div>
  )
}
