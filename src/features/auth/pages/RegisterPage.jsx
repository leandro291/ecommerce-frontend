import { Link, useNavigate } from "react-router"
import Button from "../../../components/ui/Button"
import AuthField from "../components/AuthField"
import { useRegister } from "../queries/useRegister"

// Campos del schema Register que tienen input en el formulario. `id` y `role`
// son readOnly y no se envían nunca.
const FIELDS = [
  "email",
  "username",
  "password",
  "password2",
  "first_name",
  "last_name",
]

const joinMessages = (value) => [].concat(value).join(" ")

// Los 400 del registro vienen por campo: { "email": ["..."] }.
function fieldErrors(error) {
  if (error?.status !== 400 || !error.data || typeof error.data !== "object")
    return {}
  return Object.fromEntries(
    FIELDS.filter((field) => error.data[field]).map((field) => [
      field,
      joinMessages(error.data[field]),
    ]),
  )
}

// Todo lo que no matchea un campo del formulario (detail, non_field_errors, o un
// cuerpo con otra forma) se muestra arriba.
function generalError(error) {
  if (!error) return null
  if (error.status === 400 && error.data && typeof error.data === "object") {
    const extra = Object.keys(error.data).filter((key) => !FIELDS.includes(key))
    return extra.length ? extra.map((key) => joinMessages(error.data[key])).join(" ") : null
  }
  return "No pudimos crear la cuenta. Probá de nuevo."
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const registerMutation = useRegister()

  // Bloqueo nativo del submit si las contraseñas no coinciden: cero viajes al
  // servidor por un typo.
  const syncPasswords = (event) => {
    const { password, password2 } = event.currentTarget.form.elements
    password2.setCustomValidity(
      password2.value === password.value ? "" : "Las contraseñas no coinciden.",
    )
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const email = form.get("email")
    const body = {
      email,
      username: form.get("username"),
      password: form.get("password"),
      password2: form.get("password2"),
    }
    // first_name y last_name son opcionales: si van vacíos, no se mandan.
    for (const field of ["first_name", "last_name"]) {
      const value = form.get(field).trim()
      if (value) body[field] = value
    }

    registerMutation.mutate(body, {
      onSuccess: () =>
        navigate("/login", { replace: true, state: { registered: true, email } }),
    })
  }

  const errors = fieldErrors(registerMutation.error)
  const message = generalError(registerMutation.error)

  return (
    <div className="mx-auto w-full max-w-[440px] px-5 py-14 md:py-20">
      <h1 className="text-4xl font-bold uppercase leading-none -tracking-[0.035em]">
        Crear cuenta
      </h1>
      <p className="mt-3 text-[15px] text-muted">
        Te registrás con usuario y correo; después entrás con el correo.
      </p>

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
          id="registro-email"
          name="email"
          label="Correo"
          type="email"
          autoComplete="email"
          maxLength={254}
          placeholder="vos@correo.com"
          required
          error={errors.email}
        />
        <AuthField
          id="registro-username"
          name="username"
          label="Usuario"
          type="text"
          autoComplete="username"
          pattern="[\w.@+-]+"
          maxLength={150}
          hint="Letras, números y @ . + - _"
          required
          error={errors.username}
        />
        <AuthField
          id="registro-password"
          name="password"
          label="Contraseña"
          type="password"
          autoComplete="new-password"
          onInput={syncPasswords}
          required
          error={errors.password}
        />
        <AuthField
          id="registro-password2"
          name="password2"
          label="Repetir contraseña"
          type="password"
          autoComplete="new-password"
          onInput={syncPasswords}
          required
          error={errors.password2}
        />
        <AuthField
          id="registro-first-name"
          name="first_name"
          label="Nombre (opcional)"
          type="text"
          autoComplete="given-name"
          maxLength={150}
          error={errors.first_name}
        />
        <AuthField
          id="registro-last-name"
          name="last_name"
          label="Apellido (opcional)"
          type="text"
          autoComplete="family-name"
          maxLength={150}
          error={errors.last_name}
        />
        <Button
          type="submit"
          disabled={registerMutation.isPending}
          className="mt-2 disabled:opacity-60"
        >
          {registerMutation.isPending ? "Creando cuenta…" : "Crear cuenta"}
        </Button>
      </form>

      <p className="mt-6 text-[15px] text-muted">
        ¿Ya tenés cuenta?{" "}
        <Link
          to="/login"
          className="font-medium text-acc underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acc"
        >
          Ingresar
        </Link>
      </p>
    </div>
  )
}
