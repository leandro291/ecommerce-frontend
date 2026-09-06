import Badge from "../../../components/ui/Badge"
import IconButton from "../../../components/ui/IconButton"
import { HeartIcon, PackageIcon } from "../../../components/ui/icons"

// La API guarda una sola `image_url` por producto: la imagen principal es un
// placeholder y las 4 miniaturas son espacio previsto, sin estado de selección.
const THUMBS = [0, 1, 2, 3]

export default function ProductGallery() {
  return (
    <div className="flex flex-col gap-4">
      <div className="img-ph relative flex h-[320px] items-center justify-center rounded-[20px] md:h-[520px]">
        <Badge variant="nuevo" className="absolute left-5 top-5" />
        <IconButton
          label="Agregar a favoritos"
          className="absolute right-[18px] top-[18px] h-12 w-12"
        >
          <HeartIcon className="h-[21px] w-[21px]" />
        </IconButton>
        <PackageIcon className="h-[140px] w-[140px] text-fg opacity-10 md:h-[200px] md:w-[200px]" />
      </div>

      <div className="grid grid-cols-4 gap-3.5">
        {THUMBS.map((i) => (
          <div
            key={i}
            className={`img-ph flex h-[84px] items-center justify-center rounded-[13px] border-[1.5px] md:h-[108px] ${
              i === 0 ? "border-acc" : "border-line"
            }`}
          >
            <PackageIcon className="h-[46px] w-[46px] text-fg opacity-10" />
          </div>
        ))}
      </div>

      <p className="mt-1.5 px-0.5 text-xs text-faint-2">
        La API guarda una sola <span className="text-muted">image_url</span> por
        producto: las miniaturas quedan como espacio previsto, no como dato
        existente.
      </p>
    </div>
  )
}
