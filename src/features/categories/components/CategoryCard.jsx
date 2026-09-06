import { Link } from "react-router"

// La API no tiene campo de ícono. Mapa decorativo local slug -> paths SVG,
// con un ícono genérico para las categorías que no matchean.
const ICONS = {
  computo: (
    <>
      <rect x="3" y="5" width="18" height="12" rx="2" />
      <path d="M2 20h20" />
    </>
  ),
  celulares: (
    <>
      <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
      <path d="M10.5 18.6h3" />
    </>
  ),
  audio: (
    <>
      <path d="M4 15v-3a8 8 0 0 1 16 0v3" />
      <rect x="2.5" y="14" width="4.6" height="6.6" rx="2.1" />
      <rect x="16.9" y="14" width="4.6" height="6.6" rx="2.1" />
    </>
  ),
  hogar: (
    <>
      <path d="M3.5 10.5 12 3.5l8.5 7" />
      <path d="M5.6 9.6V20h12.8V9.6" />
    </>
  ),
  accesorios: (
    <>
      <rect x="2.5" y="6" width="19" height="12" rx="2" />
      <path d="M6 10.2h.02M9.6 10.2h.02M13.2 10.2h.02M16.8 10.2h.02M8 14h8" />
    </>
  ),
  gaming: (
    <>
      <path d="M7.6 8h8.8a5 5 0 0 1 4.9 5.9l-.5 2.6A2.6 2.6 0 0 1 16.3 17L15 15.6H9L7.7 17a2.6 2.6 0 0 1-4.5-.5l-.5-2.6A5 5 0 0 1 7.6 8Z" />
      <path d="M8 11v2.6M6.7 12.3h2.6M15.6 11.6h.02M17.6 13.1h.02" />
    </>
  ),
}

const GENERIC = (
  <>
    <path d="M3 8.5A2.5 2.5 0 0 1 5.5 6h6l9 9-6.5 6.5-9-9v-4Z" />
    <circle cx="8" cy="10.5" r="1.4" />
  </>
)

export default function CategoryCard({ category }) {
  return (
    <Link
      to="/catalogo"
      className="flex flex-col gap-4 rounded-[18px] border border-line bg-surface p-5 transition hover:border-line-hover hover:bg-[#1d1d23] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acc focus-visible:ring-offset-2 focus-visible:ring-offset-bg md:p-6"
    >
      <span className="flex text-acc">
        <svg
          className="h-[23px] w-[23px] md:h-[26px] md:w-[26px]"
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {ICONS[category.slug] ?? GENERIC}
        </svg>
      </span>
      <div>
        <h3 className="mb-1.5 text-base font-semibold -tracking-[0.02em] md:text-[19px]">
          {category.name}
        </h3>
        {category.description && (
          <p className="hidden text-sm leading-relaxed text-muted sm:block">
            {category.description}
          </p>
        )}
      </div>
    </Link>
  )
}
