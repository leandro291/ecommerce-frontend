import { formatDate } from "../../../utils/formatDate"

// `product` con forma `ProductRead`. `is_active` se muestra legible:
// true -> "Publicado", false -> "Oculto".
export default function ProductMeta({ product }) {
  const rows = [
    { label: "Categoría", value: product.category.name },
    { label: "Stock", value: `${product.stock} unidades` },
    {
      label: "Estado",
      value: (
        // TODO(002): el punto siempre es bg-acc; darle color por is_active
        // (hoy toda la muestra viene is_active: true).
        <span className="flex items-center gap-2">
          <span className="h-[7px] w-[7px] rounded-full bg-acc" />
          {product.is_active ? "Publicado" : "Oculto"}
        </span>
      ),
    },
    { label: "Actualizado", value: formatDate(product.updated_at) },
  ]

  return (
    <dl className="mb-7 overflow-hidden rounded-2xl border border-line">
      {rows.map((row, index) => (
        <div
          key={row.label}
          className={`flex items-center justify-between px-5 py-[15px] ${
            index < rows.length - 1 ? "border-b border-surface" : ""
          }`}
        >
          <dt className="text-sm text-faint">{row.label}</dt>
          <dd className="text-[15px] font-medium">{row.value}</dd>
        </div>
      ))}
    </dl>
  )
}
