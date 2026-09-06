import { useMutation } from "@tanstack/react-query"
import { tokenStore } from "../../../lib/tokenStore"
import { login } from "../api/authApi"
import { useSession } from "./useSession"

export function useLogin() {
  const { signIn } = useSession()

  return useMutation({
    mutationFn: login,
    onSuccess: ({ access, refresh }, { email }) => {
      // El login no devuelve nada del usuario. Si el perfil guardado en este
      // navegador es del mismo email, se conserva (mantiene el nombre de un
      // registro previo); si no, se guarda solo el email. Nunca se arrastra el
      // nombre del usuario anterior.
      const saved = tokenStore.user
      const user = saved?.email === email ? saved : { email }
      signIn({ access, refresh, user })
    },
  })
}
