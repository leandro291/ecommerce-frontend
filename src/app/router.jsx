import { createBrowserRouter } from "react-router"
import StoreLayout from "../components/layout/StoreLayout"
import LoginPage from "../features/auth/pages/LoginPage"
import RegisterPage from "../features/auth/pages/RegisterPage"
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
      // La tienda es pública: estas dos son las únicas rutas de cuenta y no
      // hay ninguna guarda sobre las de arriba.
      { path: "login", element: <LoginPage /> },
      { path: "registro", element: <RegisterPage /> },
    ],
  },
])
