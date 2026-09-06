import { Link } from "react-router"

// items: [{ label, to? }]. El último ítem se pinta como texto plano, sin enlace.
export default function Breadcrumbs({ items }) {
  return (
    <nav
      aria-label="Migas de pan"
      className="flex flex-wrap items-center gap-2.5 text-[13px] text-faint"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <span key={item.label} className="flex items-center gap-2.5">
            {isLast || !item.to ? (
              <span className="text-fg-soft">{item.label}</span>
            ) : (
              <Link to={item.to} className="text-muted transition hover:text-fg">
                {item.label}
              </Link>
            )}
            {!isLast && <span aria-hidden="true">·</span>}
          </span>
        )
      })}
    </nav>
  )
}
