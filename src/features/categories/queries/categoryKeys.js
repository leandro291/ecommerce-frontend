// Única fuente de las query keys de categorías: nunca un array literal suelto.
export const categoryKeys = {
  all: ["categories"],
  lists: () => [...categoryKeys.all, "list"],
  list: (filters) => [...categoryKeys.lists(), filters],
  details: () => [...categoryKeys.all, "detail"],
  detail: (id) => [...categoryKeys.details(), id],
}
