import ProductCard from "./ProductCard"

// Grilla responsive de ProductCard: 1 columna en móvil, 3 en desktop.
// Si `products` viene vacío no renderiza nada: el EmptyState lo decide la página.
export default function ProductGrid({ products }) {
  if (!products.length) return null
  return (
    <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3 md:gap-5">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
