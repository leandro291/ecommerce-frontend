import { useEffect, useRef, useState } from "react"
import { Link } from "react-router"
import {
  ChevronDownIcon,
  LoginIcon,
  UserIcon,
  UserPlusIcon,
} from "../ui/icons"

// Las rutas /login y /registro todavía no existen (llegan con el spec de auth):
// hasta entonces dan 404, y es lo esperado.
export default function AccountMenu() {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false)
    }
    const onClickOutside = (e) => {
      if (!containerRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener("keydown", onKeyDown)
    document.addEventListener("pointerdown", onClickOutside)
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.removeEventListener("pointerdown", onClickOutside)
    }
  }, [open])

  const linkClass =
    "flex items-center gap-3 rounded-lg px-3 py-3 text-[15px] font-medium text-fg transition hover:bg-line focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acc"

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        className="flex items-center gap-2 rounded-full text-[15px] font-medium text-icon transition hover:text-acc focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acc"
      >
        <UserIcon className="h-5 w-5" />
        <span className="hidden sm:inline">Cuenta</span>
        <ChevronDownIcon
          className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-30 w-[246px] rounded-2xl border border-line-2 bg-surface p-2 shadow-[0_18px_44px_rgba(0,0,0,0.55)]">
          <Link to="/login" onClick={() => setOpen(false)} className={linkClass}>
            <LoginIcon className="h-[18px] w-[18px] text-acc" />
            Iniciar sesión
          </Link>
          <Link
            to="/registro"
            onClick={() => setOpen(false)}
            className={linkClass}
          >
            <UserPlusIcon className="h-[18px] w-[18px] text-acc" />
            Crear cuenta
          </Link>
          <div className="mx-3 my-2 h-px bg-line-2" />
          <p className="px-3 pb-2.5 pt-1 text-[13px] leading-snug text-faint">
            Se entra con el correo, no con el usuario.
          </p>
        </div>
      )}
    </div>
  )
}
