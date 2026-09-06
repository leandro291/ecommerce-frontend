const BASE =
  "inline-flex h-[38px] w-[38px] items-center justify-center rounded-full border border-line-3 bg-bg/60 text-fg-soft transition hover:border-acc hover:text-acc focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acc focus-visible:ring-offset-2 focus-visible:ring-offset-bg"

// Botón redondo de ícono. Decorativo por defecto: no recibe onClick desde el
// spec 001 (el corazón de wishlist todavía no hace nada). `label` alimenta el
// aria-label. Cualquier prop extra se reenvía al <button>.
export default function IconButton({ label, className = "", children, ...rest }) {
  return (
    <button
      type="button"
      aria-label={label}
      className={`${BASE} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
