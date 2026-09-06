import { Link } from "react-router"
import CategoryGrid from "../../categories/components/CategoryGrid"
import Hero from "../components/Hero"
import ProductGrid from "../components/ProductGrid"
import Button from "../../../components/ui/Button"

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
]

export default function HomePage() {
  return (
    <>
      <Hero featured={PRODUCTS[0]} />
      <CategoryGrid categories={CATEGORIES} />

      <section
        id="novedades"
        className="mx-auto max-w-[1280px] px-5 pb-10 md:px-10"
      >
        <div className="mb-6 flex items-end justify-between md:mb-8">
          <div>
            <span className="mb-3 block font-display text-xs font-medium uppercase tracking-[0.16em] text-acc">
              Novedades
            </span>
            <h2 className="text-3xl font-bold uppercase leading-tight -tracking-[0.03em] md:text-[40px]">
              Lo último que entró
            </h2>
          </div>
          <span className="hidden pb-2 text-sm text-faint md:block">
            Ordenado por fecha de alta
          </span>
        </div>

        <ProductGrid products={PRODUCTS} />

        {/* Texto genérico a propósito: la maqueta hardcodea el conteo
            ("Ver los 9 productos"); acá no se ata a los datos. */}
        <div className="flex justify-center pt-11">
          <Button as={Link} to="/catalogo" variant="ghost">
            Ver todo el catálogo
          </Button>
        </div>
      </section>
    </>
  )
}
