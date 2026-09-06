// Set de íconos compartidos (línea, 24x24). Se repiten en header, nav, cards y
// ficha de producto; se centralizan acá para no copiar los mismos paths.
// Los íconos de categoría viven aparte, en CategoryCard (mapa por slug).

const box = (props) => ({
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true",
  focusable: "false",
  ...props,
})

export function MenuIcon(props) {
  return (
    <svg {...box({ strokeWidth: 2, ...props })}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}

export function SearchIcon(props) {
  return (
    <svg {...box({ strokeWidth: 1.9, ...props })}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.6-3.6" />
    </svg>
  )
}

export function UserIcon(props) {
  return (
    <svg {...box({ strokeWidth: 1.9, ...props })}>
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5 20c1.3-3.6 4-5.4 7-5.4s5.7 1.8 7 5.4" />
    </svg>
  )
}

export function ChevronDownIcon(props) {
  return (
    <svg {...box({ strokeWidth: 2.2, ...props })}>
      <path d="M6 9.5l6 6 6-6" />
    </svg>
  )
}

export function ArrowRightIcon(props) {
  return (
    <svg {...box({ strokeWidth: 2.1, ...props })}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

export function HeartIcon(props) {
  return (
    <svg {...box({ strokeWidth: 1.8, ...props })}>
      <path d="M12 20s-7.5-4.6-7.5-9.4A4.1 4.1 0 0 1 12 8.2a4.1 4.1 0 0 1 7.5 2.4C19.5 15.4 12 20 12 20Z" />
    </svg>
  )
}

export function PackageIcon(props) {
  return (
    <svg {...box({ strokeWidth: 1.1, ...props })}>
      <path d="M12 3l9 5v8l-9 5-9-5V8l9-5Z" />
      <path d="M3 8l9 5 9-5M12 13v8" />
    </svg>
  )
}

export function CloseIcon(props) {
  return (
    <svg {...box({ strokeWidth: 2.4, ...props })}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

export function LoginIcon(props) {
  return (
    <svg {...box({ strokeWidth: 1.9, ...props })}>
      <path d="M14 3.5h4.5A1.5 1.5 0 0 1 20 5v14a1.5 1.5 0 0 1-1.5 1.5H14" />
      <path d="M9.5 16 14 12l-4.5-4M14 12H4" />
    </svg>
  )
}

export function UserPlusIcon(props) {
  return (
    <svg {...box({ strokeWidth: 1.9, ...props })}>
      <circle cx="10" cy="8" r="3.4" />
      <path d="M3.5 20c1.1-3.4 3.6-5.2 6.5-5.2" />
      <path d="M17.5 13.5v6M14.5 16.5h6" />
    </svg>
  )
}

export function HomeIcon(props) {
  return (
    <svg {...box({ strokeWidth: 1.8, ...props })}>
      <path d="M3.5 10.5 12 3.5l8.5 7" />
      <path d="M5.6 9.6V20h12.8V9.6" />
    </svg>
  )
}

export function GridIcon(props) {
  return (
    <svg {...box({ strokeWidth: 1.8, ...props })}>
      <rect x="3" y="3" width="7" height="7" rx="1.6" />
      <rect x="14" y="3" width="7" height="7" rx="1.6" />
      <rect x="3" y="14" width="7" height="7" rx="1.6" />
      <rect x="14" y="14" width="7" height="7" rx="1.6" />
    </svg>
  )
}
