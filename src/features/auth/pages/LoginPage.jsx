import { Link, Navigate, useLocation } from "react-router"
import Button from "../../../components/ui/Button"
import AuthField from "../components/AuthField"
import { useLogin } from "../queries/useLogin"
import { useSession } from "../queries/useSession"

// El yaml no declara respuestas de error para /auth/login/. SimpleJWT devuelve
// 401 con { detail: "..." } en inglés: se traduce a un mensaje propio.
function errorMessage(error) {
  if (!error) return null
  if (error.status === 401 || error.data?.detail)
    return "Correo o contraseña incorrectos."
  return "No pudimos conectarnos. Probá de nuevo."
}

export default function LoginPage() {
  const location = useLocation()
  const { isAuthenticated } = useSession()
  const loginMutation = useLogin()

  const { registered, email: registeredEmail, from } = location.state ?? {}

  // Único camino de salida: lo dispara `isAuthenticated`, así vale tanto para el
  // login recién hecho como para entrar a /login con sesión abierta.
  if (isAuthenticated) return <Navigate to={from ?? "/"} replace />

  const handleSubmit = (event) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    loginMutation.mutate({
      email: form.get("email"),
      password: form.get("password"),
    })
  }

  const message = errorMessage(loginMutation.error)

  return (
    <div className="mx-auto w-full max-w-[440px] px-5 py-14 md:py-20">
      <h1 className="text-4xl font-bold uppercase leading-none -tracking-[0.035em]">
        Ingresar
      </h1>
      <p className="mt-3 text-[15px] text-muted">
        Se entra con el correo, no con el usuario.
      </p>

      {registered && (
        <p
          role="status"
          className="mt-6 rounded-xl border border-acc/40 bg-surface px-4 py-3 text-[15px] text-fg-soft"
        >
          Cuenta creada. Ya podés ingresar.
        </p>
      )}

      {message && (
        <p
          role="alert"
          className="mt-6 rounded-xl border border-red-500/40 bg-surface px-4 py-3 text-[15px] text-red-300"
        >
          {message}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
        <AuthField
          id="login-email"
          name="email"
          label="Correo"
          type="email"
          autoComplete="email"
          maxLength={254}
          defaultValue={registeredEmail ?? ""}
          placeholder="vos@correo.com"
          required
        />
        <AuthField
          id="login-password"
          name="password"
          label="Contraseña"
          type="password"
          autoComplete="current-password"
          required
        />
        <Button
          type="submit"
          disabled={loginMutation.isPending}
          className="mt-2 disabled:opacity-60"
        >
          {loginMutation.isPending ? "Ingresando…" : "Ingresar"}
        </Button>
      </form>

      <p className="mt-6 text-[15px] text-muted">
        ¿No tenés cuenta?{" "}
        <Link
          to="/registro"
          className="font-medium text-acc underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acc"
        >
          Crear cuenta
        </Link>
      </p>
    </div>
  )
}
