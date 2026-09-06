const VARIANTS = {
  acc: "bg-acc text-bg font-semibold hover:brightness-110",
  ghost:
    "border border-line-2 text-fg-soft font-medium hover:border-acc hover:text-acc",
}

const BASE =
  "inline-flex items-center justify-center gap-2.5 rounded-full px-7 py-4 text-base leading-none tracking-tight transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acc focus-visible:ring-offset-2 focus-visible:ring-offset-bg"

// `as` permite renderizar el botón como otro elemento (por ejemplo el <Link>
// de react-router). El resto de props se reenvía al elemento nativo.
export default function Button({
  as: Component = "button",
  variant = "acc",
  className = "",
  children,
  ...rest
}) {
  return (
    <Component className={`${BASE} ${VARIANTS[variant]} ${className}`} {...rest}>
      {children}
    </Component>
  )
}
