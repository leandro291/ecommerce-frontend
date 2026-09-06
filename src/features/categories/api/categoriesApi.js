import { apiClient } from "../../../lib/apiClient"

// GET /categories/ -> { count, next, previous, results }.
// Filtros del yaml: is_active, name, search, ordering, page.
export function listCategories(params) {
  return apiClient("/categories/", { params })
}
