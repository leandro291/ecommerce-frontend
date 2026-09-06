import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router'
import './index.css'
import { router } from './app/router.jsx'
import { SessionProvider } from './features/auth/queries/useSession.js'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // el catálogo no cambia cada segundo
      // Un 400 o un 404 no mejoran repitiendo la llamada.
      retry: (failCount, error) =>
        error?.status >= 400 && error?.status < 500 ? false : failCount < 2,
      refetchOnWindowFocus: false,
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <RouterProvider router={router} />
      </SessionProvider>
    </QueryClientProvider>
  </StrictMode>,
)
