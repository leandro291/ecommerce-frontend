import { NavLink } from "react-router"
import { GridIcon, HomeIcon, UserIcon } from "../ui/icons"

const TABS = [
  { to: "/", label: "Inicio", Icon: HomeIcon, end: true },
  { to: "/catalogo", label: "Catálogo", Icon: GridIcon },
  { to: "/login", label: "Cuenta", Icon: UserIcon },
]

export default function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-bg md:hidden">
      {TABS.map(({ to, label, Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-1 pb-[calc(0.625rem+env(safe-area-inset-bottom))] pt-2.5 text-[11px] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-acc ${
              isActive ? "text-acc" : "text-muted"
            }`
          }
        >
          <Icon className="h-[22px] w-[22px]" />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
