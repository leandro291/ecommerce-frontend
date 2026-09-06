import { queryOptions, useQuery } from "@tanstack/react-query"
import { listCategories } from "../api/categoriesApi"
import { categoryKeys } from "./categoryKeys"

// `filters` entra tal cual a la key: dos filtros distintos son dos entradas de cache.
export function useCategories(filters) {
  return useQuery(
    queryOptions({
      queryKey: categoryKeys.list(filters),
      queryFn: () => listCategories(filters),
    }),
  )
}
