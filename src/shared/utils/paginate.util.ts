export function paginate<T>(array: T[], skip: number, limit: number): T[] {
  const endIndex = skip + limit
  return array.slice(skip, endIndex)
}
