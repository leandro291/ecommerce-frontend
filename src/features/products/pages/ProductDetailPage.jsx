import { Link, useParams } from "react-router"
import Breadcrumbs from "../../../components/ui/Breadcrumbs"
import { ArrowRightIcon } from "../../../components/ui/icons"
import ProductGallery from "../components/ProductGallery"
import ProductInfo from "../components/ProductInfo"
import ProductMeta from "../components/ProductMeta"
import ProductActions from "../components/ProductActions"
import ProductGrid from "../components/ProductGrid"

// TODO(002): reemplazar por datos de la API
const PRODUCTS = [
  { id: 1, name: "Audífonos inalámbricos con cancelación de ruido", description: "Cancelación activa de ruido con seis micrófonos, hasta 30 horas de batería con el estuche y carga rápida USB-C. Bluetooth 5.3 con conexión a dos equipos a la vez.", price: "1299.00", stock: 12, is_active: true, image_url: "", category: { id: 3, name: "Audio", slug: "audio" }, created_at: "2026-08-30T10:00:00Z", updated_at: "2026-09-02T09:30:00Z" },
  { id: 2, name: 'Laptop ultraligera 14" Ryzen 7 · 16 GB', description: "Chasis de aluminio, 1.2 kg y pantalla mate de 14 pulgadas. 16 GB de RAM y 512 GB SSD.", price: "3499.00", stock: 4, is_active: true, image_url: "", category: { id: 1, name: "Cómputo", slug: "computo" }, created_at: "2026-08-28T10:00:00Z", updated_at: "2026-08-29T12:00:00Z" },
  { id: 3, name: 'Smartphone 6.7" · 256 GB', description: "Pantalla OLED de 120 Hz y triple cámara de 50 MP. Batería de 5000 mAh con carga de 67 W.", price: "2150.00", stock: 21, is_active: true, image_url: "", category: { id: 2, name: "Celulares", slug: "celulares" }, created_at: "2026-08-26T10:00:00Z", updated_at: "2026-08-27T08:00:00Z" },
  { id: 4, name: "Cafetera espresso automática", description: "Molinillo integrado y espumador de leche automático. Depósito de 1.8 litros.", price: "985.00", stock: 3, is_active: true, image_url: "", category: { id: 4, name: "Hogar", slug: "hogar" }, created_at: "2026-08-24T10:00:00Z", updated_at: "2026-08-25T15:00:00Z" },
  { id: 5, name: 'Monitor 27" 165 Hz QHD', description: "Panel IPS QHD con 165 Hz y 1 ms de respuesta. Base ajustable en altura y pivote.", price: "1049.00", stock: 0, is_active: true, image_url: "", category: { id: 1, name: "Cómputo", slug: "computo" }, created_at: "2026-08-22T10:00:00Z", updated_at: "2026-08-23T11:00:00Z" },
  { id: 6, name: "Teclado mecánico inalámbrico", description: "Switches hot-swap y conexión por Bluetooth o receptor 2.4 GHz. Autonomía de 200 horas.", price: "329.00", stock: 18, is_active: true, image_url: "", category: { id: 5, name: "Accesorios", slug: "accesorios" }, created_at: "2026-08-20T10:00:00Z", updated_at: "2026-08-21T10:00:00Z" },
  { id: 7, name: "Parlante portátil resistente al agua", description: "Certificación IP67 y 20 horas de reproducción continua. Emparejamiento estéreo entre dos unidades.", price: "459.00", stock: 9, is_active: true, image_url: "", category: { id: 3, name: "Audio", slug: "audio" }, created_at: "2026-08-18T10:00:00Z", updated_at: "2026-08-19T10:00:00Z" },
  { id: 8, name: "Robot aspirador con mapeo láser", description: "Mapeo LiDAR, vaciado automático y control por app. Detecta obstáculos en tiempo real.", price: "1590.00", stock: 2, is_active: true, image_url: "", category: { id: 4, name: "Hogar", slug: "hogar" }, created_at: "2026-08-16T10:00:00Z", updated_at: "2026-08-17T10:00:00Z" },
  { id: 9, name: "Mouse gamer 26K DPI", description: "Sensor óptico de 26.000 DPI y 60 g de peso. Switches ópticos de 90 millones de clics.", price: "189.00", stock: 33, is_active: true, image_url: "", category: { id: 6, name: "Gaming", slug: "gaming" }, created_at: "2026-08-14T10:00:00Z", updated_at: "2026-08-15T10:00:00Z" },
]

export default function ProductDetailPage() {
  const { id } = useParams()
  const product = PRODUCTS.find((p) => String(p.id) === id) ?? PRODUCTS[0]
  const related = PRODUCTS.filter(
    (p) => p.category.id === product.category.id && p.id !== product.id,
  ).slice(0, 3)

  return (
    <div className="mx-auto max-w-[1280px] px-5 pb-20 pt-7 md:px-10">
      <Breadcrumbs
        items={[
          { label: "Inicio", to: "/" },
          { label: "Catálogo", to: "/catalogo" },
          { label: product.category.name, to: "/catalogo" },
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

      {related.length > 0 && (
        <section className="mt-4">
          <div className="mb-7 flex items-end justify-between">
            <h2 className="text-2xl font-bold uppercase leading-tight -tracking-[0.03em] md:text-[32px]">
              Más de {product.category.name}
            </h2>
            <Link
              to="/catalogo"
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
