// Campo de formulario con su error del backend. El resto de props se reenvía al
// <input> nativo (type, required, pattern, autoComplete, maxLength...).
export default function AuthField({ id, label, error, hint, ...rest }) {
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const describedBy = [error && errorId, hint && hintId].filter(Boolean).join(" ")

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-xs uppercase tracking-[0.12em] text-faint"
      >
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        className={`h-12 w-full rounded-[11px] border bg-surface-2 px-3.5 text-[15px] text-fg placeholder:text-faint-2 focus-visible:border-acc focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acc ${
          error ? "border-red-500" : "border-line-2"
        }`}
        {...rest}
      />
      {hint && (
        <p id={hintId} className="mt-1.5 text-xs leading-relaxed text-faint-2">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-[13px] text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}
