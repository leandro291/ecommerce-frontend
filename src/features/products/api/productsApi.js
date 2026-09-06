import { apiClient } from "../../../lib/apiClient"

// GET /products/ -> { count, next, previous, results }.
// Filtros del yaml: category (id), in_stock, is_active, price_min, price_max,
// search, ordering, page.
export function listProducts(params) {
  return apiClient("/products/", { params })
}

// GET /products/{id}/ -> ProductRead. Un id inexistente sale como ApiError 404.
export function getProduct(id) {
  return apiClient(`/products/${id}/`)
}
