import { Link } from "react-router"
import AccountMenu from "./AccountMenu"
import { MenuIcon, SearchIcon } from "../ui/icons"

export default function Header() {
  return (
    <header className="relative z-20 border-b border-line bg-bg">
      <div className="mx-auto flex h-16 max-w-[1360px] items-center gap-3 px-5 md:h-[76px] md:gap-9 md:px-10">
        <button
          type="button"
          aria-label="Abrir menú"
          className="-ml-2.5 flex h-11 w-11 items-center justify-center text-icon md:hidden"
        >
          <MenuIcon className="h-[22px] w-[22px]" />
        </button>

        <Link
          to="/"
          className="rounded font-display text-[19px] font-bold -tracking-[0.03em] text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acc md:text-[21px]"
        >
          [MARCA]
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <Link
            to="/catalogo"
            className="flex items-center gap-2.5 rounded-full bg-acc py-2.5 pl-4 pr-5 text-[15px] font-semibold text-bg transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acc focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            <MenuIcon className="h-[17px] w-[17px]" strokeWidth={2.1} />
            Catálogo
          </Link>
          <a
            href="/#novedades"
            className="text-[15px] font-medium text-muted transition hover:text-fg"
          >
            Novedades
          </a>
          <a
            href="/#categorias"
            className="text-[15px] font-medium text-muted transition hover:text-fg"
          >
            Categorías
          </a>
        </div>

        <div className="grow" />

        {/* El buscador vive en los filtros del catálogo: la lupa lleva ahí. */}
        <Link
          to="/catalogo"
          aria-label="Buscar en el catálogo"
          className="flex h-11 w-11 items-center justify-center rounded-full text-icon transition hover:text-acc focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acc md:h-auto md:w-auto"
        >
          <SearchIcon className="h-5 w-5" />
        </Link>
        <AccountMenu />
      </div>
    </header>
  )
}
