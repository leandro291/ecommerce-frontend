import { queryOptions, useQuery } from "@tanstack/react-query"
import { getProduct } from "../api/productsApi"
import { productKeys } from "./productKeys"

// Sin `id` (ruta a medio resolver) no se pide nada.
export function useProduct(id) {
  return useQuery(
    queryOptions({
      queryKey: productKeys.detail(id),
      queryFn: () => getProduct(id),
      enabled: Boolean(id),
    }),
  )
}
