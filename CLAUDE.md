# Ecommerce Frontend

Frontend web que consume una API REST de Django ya existente. Acá **solo** se construye
la capa visual y de datos del cliente: no se toca ni se propone tocar el backend.

## Stack

| Pieza | Versión | Por qué |
|---|---|---|
| React | 19.2.8 | Librería base |
| Vite | 8.2.2 | Build y dev server |
| React Router | 8.3.1 | Ruteo SPA |
| TanStack Query | 5.102.8 | Estado del servidor: cache, refetch, invalidación |
| Tailwind CSS | 4.3.3 | Estilos (plugin `@tailwindcss/vite`, sin PostCSS ni `tailwind.config.js`) |
| JavaScript | ES2023 | **JS nativo, sin TypeScript.** Nada de `.ts` / `.tsx` |

Al agregar o actualizar una dependencia, consultá su documentación con **Context7**
antes de escribir código: las versiones de arriba son recientes y la API pudo cambiar
respecto a lo que el modelo recuerda.

## Documentos de referencia

| Archivo | Contiene |
|---|---|
| [`SETUP.md`](./SETUP.md) | **Arquitectura de carpetas y dependencias. Es obligatorio respetarla.** |
| [`docs/ecommerce-api.yaml`](./docs/ecommerce-api.yaml) | Contrato OpenAPI de la API de Django. Única fuente de verdad de endpoints y modelos |
| `docs/specs/` | Specs generados por el agente Spec, uno por funcionalidad |

## Metodología: SDD (Spec Driven Development)

Ningún cambio de funcionalidad se escribe sin un spec aprobado. El flujo es:

```
Pedido del usuario
      │
      ▼
┌─────────────┐   ¿requiere spec?
│ orquestador │───── no ──► modo build normal de Claude Code
└─────────────┘
      │ sí
      ▼
┌──────┐   escribe docs/specs/NNN-nombre.md
│ spec │   ► SE DETIENE Y ESPERA APROBACIÓN EXPLÍCITA DEL USUARIO
└──────┘
      │ aprobado
      ▼
┌───────────┐   ejecuta las tareas del spec
│ developer │
└───────────┘
      │
      ▼
┌──────────┐  ¿hay errores?
│ reviewer │──── sí ──► vuelve a developer (bucle, máx. 3 vueltas)
└──────────┘
      │ no
      ▼
   commit
```

### Agentes

Viven en `.claude/agents/`. Se invocan con la herramienta `Agent`.

| Agente | Archivo | Responsabilidad |
|---|---|---|
| `orquestador` | [`.claude/agents/orquestador.md`](./.claude/agents/orquestador.md) | Clasifica el pedido: SDD o build directo |
| `spec` | [`.claude/agents/spec.md`](./.claude/agents/spec.md) | Traduce el requerimiento a un `.md` de tareas. **Se detiene a esperar aprobación** |
| `developer` | [`.claude/agents/developer.md`](./.claude/agents/developer.md) | Ejecuta las tareas del spec aplicando SOLID y DRY |
| `reviewer` | [`.claude/agents/reviewer.md`](./.claude/agents/reviewer.md) | Verifica la ejecución y devuelve hallazgos al developer |

## Reglas del repositorio

1. **JS nativo.** Cero TypeScript. Cero archivos `.ts`/`.tsx`.
2. **La estructura de `SETUP.md` es obligatoria.** No inventar carpetas nuevas sin
   actualizar ese documento primero.
3. **Toda lectura o escritura del servidor pasa por TanStack Query.** Nada de `useEffect`
   + `fetch` para traer datos.
4. **Ningún componente llama a `fetch` directo.** El camino es
   `componente → hook de queries/ → función de api/ → apiClient`.
5. **El yaml manda.** Si un campo, filtro o endpoint no está en `docs/ecommerce-api.yaml`,
   no existe. No inventar campos.
6. **Commits solo con funcionalidad completa y funcional.** Nunca commitear trabajo
   parcial o en progreso. Mensaje descriptivo en español, en imperativo.
7. **Sin dependencias nuevas** si el problema se resuelve con la plataforma o con lo ya
   instalado. `fetch` antes que axios; `<input type="date">` antes que un datepicker.

## Estado actual de la API

- **Disponible:** `auth` (login, refresh, register), `categories`, `products`, `roles`.
- **Auth resuelta.** SimpleJWT sobre `/api/v1/auth/`. El login es **por email**, no por
  username. Los 18 endpoints de negocio exigen `Authorization: Bearer <access>`;
  `register` es público.
- **Pendiente:** el CRUD de `users` (listar, ver, editar, borrar usuarios) todavía no está
  en el schema. `auth/register/` crea cuentas, pero no reemplaza al módulo. Se construirá
  cuando llegue el yaml con esos endpoints.
