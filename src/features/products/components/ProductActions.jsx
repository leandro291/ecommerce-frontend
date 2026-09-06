import Button from "../../../components/ui/Button"
import IconButton from "../../../components/ui/IconButton"
import { ArrowRightIcon, HeartIcon } from "../../../components/ui/icons"

export default function ProductActions() {
  return (
    <div>
      <div className="flex items-stretch gap-3">
        {/* Placeholder: todavía no hay destino real para "Consultar
            disponibilidad" (¿WhatsApp, correo, formulario?). Sin onClick. */}
        <Button className="h-14 grow">
          Consultar disponibilidad
          <ArrowRightIcon className="h-[18px] w-[18px]" />
        </Button>
        <IconButton label="Agregar a favoritos" className="h-14 w-14">
          <HeartIcon className="h-[19px] w-[19px]" />
        </IconButton>
      </div>
      <p className="mt-4 px-0.5 text-[13px] leading-relaxed text-faint-2">
        Todavía no hay carrito ni checkout en la API. [Definí a dónde lleva
        “Consultar”: WhatsApp, correo o formulario.]
      </p>
    </div>
  )
}
