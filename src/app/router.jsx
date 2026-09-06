import { createBrowserRouter } from "react-router"
import StoreLayout from "../components/layout/StoreLayout"
import HomePage from "../features/products/pages/HomePage"
import CatalogPage from "../features/products/pages/CatalogPage"
import ProductDetailPage from "../features/products/pages/ProductDetailPage"

export const router = createBrowserRouter([
  {
    element: <StoreLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "catalogo", element: <CatalogPage /> },
      { path: "productos/:id", element: <ProductDetailPage /> },
    ],
  },
])
