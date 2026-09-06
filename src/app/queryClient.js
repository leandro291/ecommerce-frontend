import { QueryClient } from "@tanstack/react-query"

export const queryClient = new QueryClient({
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
