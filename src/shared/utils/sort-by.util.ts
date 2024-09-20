/**
 * Sorts an array by a specific property.
 *
 * @param items - The array of items to sort.
 * @param sortBy - The property by which to sort the items.
 * @param sortOrder - The order in which to sort the items ('asc' for ascending, 'desc' for descending').
 * @returns The sorted array.
 */
export function sortByProperty<T>(
  items: T[],
  sortBy: keyof T,
  sortOrder: 'asc' | 'desc' = 'asc'
): T[] {
  return items.sort((a, b) => {
    if (a[sortBy] > b[sortBy]) {
      return sortOrder === 'asc' ? 1 : -1
    } else if (a[sortBy] < b[sortBy]) {
      return sortOrder === 'asc' ? -1 : 1
    }
    return 0
  })
}
