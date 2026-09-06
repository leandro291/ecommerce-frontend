import { keepPreviousData, queryOptions, useQuery } from "@tanstack/react-query"
import { listProducts } from "../api/productsApi"
import { productKeys } from "./productKeys"

// `keepPreviousData`: al cambiar de página o de filtro la grilla anterior queda
// visible hasta que llega la nueva, en vez de saltar al estado de carga.
// `enabled` se reenvía porque los relacionados de la ficha esperan al producto.
export function useProducts(filters, { enabled } = {}) {
  return useQuery(
    queryOptions({
      queryKey: productKeys.list(filters),
      queryFn: () => listProducts(filters),
      placeholderData: keepPreviousData,
      enabled,
    }),
  )
}
