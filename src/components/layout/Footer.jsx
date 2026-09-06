import { Link } from "react-router"

const navLink = "text-[15px] font-medium text-muted transition hover:text-fg"
const colLabel =
  "text-xs uppercase tracking-[0.1em] text-faint"

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-10 px-5 py-12 md:flex-row md:items-start md:justify-between md:px-10">
        <div>
          <span className="mb-3 block font-display text-[19px] font-bold -tracking-[0.03em]">
            [MARCA]
          </span>
          <p className="text-sm text-faint">
            Precios en soles (S/), IGV incluido.
          </p>
        </div>

        <div className="flex flex-wrap gap-x-16 gap-y-8">
          <div className="flex flex-col gap-3">
            <span className={colLabel}>Tienda</span>
            <a href="/#categorias" className={navLink}>
              Categorías
            </a>
            <Link to="/catalogo" className={navLink}>
              Catálogo
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            <span className={colLabel}>Cuenta</span>
            <Link to="/login" className={navLink}>
              Iniciar sesión
            </Link>
            <Link to="/registro" className={navLink}>
              Crear cuenta
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            <span className={colLabel}>Contacto</span>
            <span className="text-[15px] text-muted">[correo de contacto]</span>
            <span className="text-[15px] text-muted">[teléfono / WhatsApp]</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
