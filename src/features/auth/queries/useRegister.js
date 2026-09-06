import { useMutation } from "@tanstack/react-query"
import { tokenStore } from "../../../lib/tokenStore"
import { register } from "../api/authApi"

export function useRegister() {
  return useMutation({
    mutationFn: register,
    // El registro no devuelve tokens: no abre sesión. Solo guarda el perfil para
    // que el avatar tenga iniciales reales en el login siguiente.
    onSuccess: ({ email, first_name, last_name }) => {
      tokenStore.save({ user: { email, first_name, last_name } })
    },
  })
}
