import Badge from "../../../components/ui/Badge"
import { PackageIcon } from "../../../components/ui/icons"
import { formatPrice } from "../../../utils/formatPrice"
import { stockLabel } from "../../../utils/stockLabel"

// Card grande del hero. `product` con forma `ProductRead`.
export default function FeaturedProduct({ product }) {
  const { name, price, stock, category } = product

  return (
    <div className="rounded-[22px] border border-line bg-surface p-[18px] md:p-[22px]">
      <div className="img-ph relative flex h-[220px] items-center justify-center rounded-2xl md:h-[300px]">
        <Badge variant="nuevo" className="absolute left-4 top-4" />
        <PackageIcon className="h-[92px] w-[92px] text-fg opacity-10 md:h-[120px] md:w-[120px]" />
      </div>
      <div className="px-1.5 pb-1 pt-5 md:px-1.5 md:pt-6">
        <span className="text-[11px] uppercase tracking-[0.1em] text-faint md:text-xs">
          {category.name}
        </span>
        <h3 className="mb-3.5 mt-2 text-lg font-semibold leading-snug -tracking-[0.02em] md:mb-4 md:text-[21px]">
          {name}
        </h3>
        <div className="flex items-baseline justify-between">
          <span className="font-display text-[26px] font-bold -tracking-[0.02em] md:text-[30px]">
            {formatPrice(price)}
          </span>
          <span className="text-[13px] text-muted">{stockLabel(stock)}</span>
        </div>
      </div>
    </div>
  )
}
