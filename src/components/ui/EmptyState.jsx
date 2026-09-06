// Título + texto + acción opcional. En el catálogo hace de "Ningún producto
// coincide"; `action` suele ser un <Button> para limpiar filtros.
export default function EmptyState({ title, description, action }) {
  return (
    <div className="rounded-2xl border border-dashed border-line-2 px-8 py-16 text-center">
      <h3 className="mb-2 text-xl font-semibold tracking-tight text-fg">
        {title}
      </h3>
      {description && <p className="mb-6 text-[15px] text-muted">{description}</p>}
      {action}
    </div>
  )
}
