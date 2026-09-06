import { Link } from "react-router"
import Badge from "../../../components/ui/Badge"
import IconButton from "../../../components/ui/IconButton"
import { HeartIcon, PackageIcon } from "../../../components/ui/icons"
import { formatPrice } from "../../../utils/formatPrice"
import { stockLabel } from "../../../utils/stockLabel"

// `product` tiene la forma de `ProductRead`: `category` es un objeto anidado
// ({ id, name, slug }), `price` es string. Reglas de stock:
//   0      -> card apagada + "Sin stock"
//   1..5   -> Badge amarillo "Últimas N unidades"
//   > 5    -> solo el texto "N disponibles"
export default function ProductCard({ product }) {
  const { id, name, stock, price, category } = product
  const soldOut = stock === 0
  const low = stock > 0 && stock <= 5

  return (
    <div
      className={`flex flex-col rounded-[18px] border border-line bg-surface p-4 transition hover:-translate-y-[3px] hover:border-line-hover ${
        soldOut ? "opacity-50" : ""
      }`}
    >
      <div className="img-ph relative flex h-[214px] items-center justify-center rounded-[13px]">
        <PackageIcon className="h-[82px] w-[82px] text-fg opacity-10" />
        <IconButton
          label="Agregar a favoritos"
          className="absolute right-3 top-3"
        >
          <HeartIcon className="h-[18px] w-[18px]" />
        </IconButton>
        {low && (
          <Badge variant="stock" className="absolute left-4 top-4">
            {stockLabel(stock)}
          </Badge>
        )}
      </div>

      <div className="flex grow flex-col gap-2.5 px-1.5 pt-[18px]">
        <span className="text-xs uppercase tracking-[0.1em] text-faint">
          {category.name}
        </span>
        <h3 className="text-[17px] font-medium leading-tight -tracking-[0.015em] text-fg-soft">
          {name}
        </h3>
        <div className="grow" />
        <div className="mt-2.5 flex items-baseline justify-between">
          <span className="font-display text-2xl font-bold -tracking-[0.02em]">
            {formatPrice(price)}
          </span>
          <span className="text-[13px] text-faint">{stockLabel(stock)}</span>
        </div>
      </div>

      <Link
        to={`/productos/${id}`}
        className="mt-4 rounded-full border border-line-3 bg-surface-2 px-5 py-3.5 text-center text-[15px] font-semibold text-fg transition hover:border-acc hover:bg-acc hover:text-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acc focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
      >
        Ver detalle
      </Link>
    </div>
  )
}
