import { createContext, createElement, useContext, useMemo, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { tokenStore } from "../../../lib/tokenStore"

// Estado de cliente, no una query: no hay endpoint que devuelva el usuario actual.
const SessionContext = createContext(null)

// Iniciales del avatar, en orden de preferencia. Con sesión nunca sale vacío
// porque el email siempre está guardado.
function initialsOf(user) {
  if (!user) return ""
  const first = user.first_name?.trim()?.[0]
  const last = user.last_name?.trim()?.[0]
  if (first && last) return `${first}${last}`.toUpperCase()
  const single = first || last || user.email?.trim()?.[0]
  return single ? single.toUpperCase() : ""
}

export function SessionProvider({ children }) {
  const queryClient = useQueryClient()
  const [session, setSession] = useState(() => ({
    user: tokenStore.user,
    isAuthenticated: Boolean(tokenStore.access),
  }))

  const value = useMemo(
    () => ({
      user: session.user,
      isAuthenticated: session.isAuthenticated,
      initials: initialsOf(session.user),
      signIn({ access, refresh, user }) {
        tokenStore.save({ access, refresh, user })
        setSession({ user: user ?? null, isAuthenticated: true })
      },
      signOut() {
        tokenStore.clear()
        // Sin esto, el próximo usuario ve los datos del anterior en el primer render.
        queryClient.clear()
        setSession({ user: null, isAuthenticated: false })
      },
    }),
    [session, queryClient],
  )

  // createElement y no JSX: SETUP.md §6 reserva este archivo como `.js`.
  return createElement(SessionContext, { value }, children)
}

export function useSession() {
  const session = useContext(SessionContext)
  if (!session) throw new Error("useSession debe usarse dentro de SessionProvider")
  return session
}
