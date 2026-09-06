import Button from "./Button"
import EmptyState from "./EmptyState"

// Detalle del ApiError si el backend mandó uno; si no, el fallo es de red.
function describe(error) {
  if (error?.data?.detail) return error.data.detail
  if (error?.status) return `La API respondió con un error ${error.status}.`
  return "Revisá tu conexión e intentá de nuevo."
}

// Carga y error de una query, con el mismo texto en las tres pantallas.
// Con datos en mano renderiza `children`: qué se ve entonces lo decide la página.
export default function QueryState({
  isPending,
  isError,
  error,
  onRetry,
  loadingTitle = "Cargando…",
  children = null,
}) {
  if (isPending) return <EmptyState title={loadingTitle} />
  if (!isError) return children

  return (
    <div role="alert">
      <EmptyState
        title="No pudimos cargar la información"
        description={describe(error)}
        action={<Button onClick={onRetry}>Reintentar</Button>}
      />
    </div>
  )
}
