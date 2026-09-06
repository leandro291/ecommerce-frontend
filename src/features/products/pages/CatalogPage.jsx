import Breadcrumbs from "../../../components/ui/Breadcrumbs"
import Button from "../../../components/ui/Button"
import EmptyState from "../../../components/ui/EmptyState"
import { ArrowRightIcon } from "../../../components/ui/icons"
import CategoryChips from "../../categories/components/CategoryChips"
import FilterSidebar from "../components/FilterSidebar"
import ProductGrid from "../components/ProductGrid"
import ResultsToolbar from "../components/ResultsToolbar"

// TODO(002): reemplazar por datos de la API
const CATEGORIES = [
  { id: 1, name: "Cómputo", slug: "computo", description: "Laptops, monitores y componentes.", is_active: true },
  { id: 2, name: "Celulares", slug: "celulares", description: "Smartphones libres y accesorios.", is_active: true },
  { id: 3, name: "Audio", slug: "audio", description: "Audífonos, parlantes y micrófonos.", is_active: true },
  { id: 4, name: "Hogar", slug: "hogar", description: "Electrodomésticos para la casa.", is_active: true },
  { id: 5, name: "Accesorios", slug: "accesorios", description: "Teclados, mouses y wearables.", is_active: true },
  { id: 6, name: "Gaming", slug: "gaming", description: "Periféricos y consolas.", is_active: true },
]

// TODO(002): reemplazar por datos de la API
const PRODUCTS = [
  { id: 1, name: "Audífonos inalámbricos con cancelación de ruido", description: "Cancelación activa de ruido y hasta 30 horas de batería con el estuche.", price: "1299.00", stock: 12, is_active: true, image_url: "", category: { id: 3, name: "Audio", slug: "audio" }, created_at: "2026-08-30T10:00:00Z", updated_at: "2026-08-30T10:00:00Z" },
  { id: 2, name: 'Laptop ultraligera 14" Ryzen 7 · 16 GB', description: "Chasis de aluminio, 1.2 kg y pantalla mate de 14 pulgadas.", price: "3499.00", stock: 4, is_active: true, image_url: "", category: { id: 1, name: "Cómputo", slug: "computo" }, created_at: "2026-08-28T10:00:00Z", updated_at: "2026-08-28T10:00:00Z" },
  { id: 3, name: 'Smartphone 6.7" · 256 GB', description: "Pantalla OLED de 120 Hz y triple cámara de 50 MP.", price: "2150.00", stock: 21, is_active: true, image_url: "", category: { id: 2, name: "Celulares", slug: "celulares" }, created_at: "2026-08-26T10:00:00Z", updated_at: "2026-08-26T10:00:00Z" },
  { id: 4, name: "Cafetera espresso automática", description: "Molinillo integrado y espumador de leche automático.", price: "985.00", stock: 3, is_active: true, image_url: "", category: { id: 4, name: "Hogar", slug: "hogar" }, created_at: "2026-08-24T10:00:00Z", updated_at: "2026-08-24T10:00:00Z" },
  { id: 5, name: 'Monitor 27" 165 Hz QHD', description: "Panel IPS QHD con 165 Hz y 1 ms de respuesta.", price: "1049.00", stock: 0, is_active: true, image_url: "", category: { id: 1, name: "Cómputo", slug: "computo" }, created_at: "2026-08-22T10:00:00Z", updated_at: "2026-08-22T10:00:00Z" },
  { id: 6, name: "Teclado mecánico inalámbrico", description: "Switches hot-swap y conexión por Bluetooth o receptor 2.4 GHz.", price: "329.00", stock: 18, is_active: true, image_url: "", category: { id: 5, name: "Accesorios", slug: "accesorios" }, created_at: "2026-08-20T10:00:00Z", updated_at: "2026-08-20T10:00:00Z" },
  { id: 7, name: "Parlante portátil resistente al agua", description: "Certificación IP67 y 20 horas de reproducción continua.", price: "459.00", stock: 9, is_active: true, image_url: "", category: { id: 3, name: "Audio", slug: "audio" }, created_at: "2026-08-18T10:00:00Z", updated_at: "2026-08-18T10:00:00Z" },
  { id: 8, name: "Robot aspirador con mapeo láser", description: "Mapeo LiDAR, vaciado automático y control por app.", price: "1590.00", stock: 2, is_active: true, image_url: "", category: { id: 4, name: "Hogar", slug: "hogar" }, created_at: "2026-08-16T10:00:00Z", updated_at: "2026-08-16T10:00:00Z" },
  { id: 9, name: "Mouse gamer 26K DPI", description: "Sensor óptico de 26.000 DPI y 60 g de peso.", price: "189.00", stock: 33, is_active: true, image_url: "", category: { id: 6, name: "Gaming", slug: "gaming" }, created_at: "2026-08-14T10:00:00Z", updated_at: "2026-08-14T10:00:00Z" },
]

// El catálogo todavía no filtra. Este flag deja el EmptyState renderizado para
// que el spec 002 lo enganche al estado "sin resultados".
const SHOW_EMPTY = false

export default function CatalogPage() {
  return (
    <div className="mx-auto max-w-[1360px] px-5 py-10 md:px-10 md:pb-20">
      <Breadcrumbs
        items={[{ label: "Inicio", to: "/" }, { label: "Catálogo" }]}
      />

      <h1 className="mb-6 mt-6 text-4xl font-bold uppercase leading-none -tracking-[0.035em] md:text-[52px]">
        Catálogo
      </h1>

      <div className="md:grid md:grid-cols-[280px_minmax(0,1fr)] md:items-start md:gap-10">
        <div className="mb-8 md:hidden">
          <CategoryChips categories={CATEGORIES} />
        </div>
        <div className="hidden md:block">
          <FilterSidebar categories={CATEGORIES} />
        </div>

        <div>
          <ResultsToolbar total={PRODUCTS.length} filters={[]} />

          {SHOW_EMPTY ? (
            <EmptyState
              title="Ningún producto coincide"
              description="Probá con menos filtros o revisá la búsqueda."
              action={<Button>Limpiar filtros</Button>}
            />
          ) : (
            <ProductGrid products={PRODUCTS} />
          )}

          {/* Paginación estática (markup). El spec 002 la conecta a ?page= */}
          <div className="mt-9 flex items-center justify-between">
            <span className="text-sm text-faint">
              1-{PRODUCTS.length} de {PRODUCTS.length}
            </span>
            <div className="flex items-center gap-2.5">
              <span
                className="flex h-11 w-11 items-center justify-center rounded-full border border-line-2 text-line-hover"
                aria-hidden="true"
              >
                <ArrowRightIcon className="h-4 w-4 rotate-180" />
              </span>
              <span className="flex h-11 min-w-11 items-center justify-center rounded-full border border-acc bg-acc px-1 text-[15px] font-semibold text-bg">
                1
              </span>
              <span
                className="flex h-11 w-11 items-center justify-center rounded-full border border-line-2 text-fg-soft"
                aria-hidden="true"
              >
                <ArrowRightIcon className="h-4 w-4" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
