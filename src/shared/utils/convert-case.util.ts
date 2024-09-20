// Utility function to convert strings to a flat (underscore-separated) format
function toFlatCaseString(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2') // camelCase to snake_case conversion
    .replace(/[-\s]/g, '_') // kebab-case to snake_case conversion (and any spaces)
    .toLowerCase() // Convert everything to lowercase
}

// Utility function to convert strings from flat case to camelCase
function toCamelCaseString(str: string): string {
  return str.replace(/_([a-z0-9])/g, (_, letter) => letter.toUpperCase())
}

// Utility function to convert strings from flat case to snake_case
function toSnakeCaseString(str: string): string {
  return str // Already in snake_case after flattening, no further changes needed
}

// Utility function to convert strings from flat case to kebab-case
function toKebabCaseString(str: string): string {
  return str.replace(/_/g, '-') // Replace underscores with hyphens
}

// Main function to convert the object's keys from any case to the desired case
export function convertCase<T extends object>(
  obj: T,
  caseType: 'camel' | 'snake' | 'kebab'
): T {
  const convertKey = (key: string): string => {
    const flatKey = toFlatCaseString(key) // First convert to a flat (snake_case) format

    switch (caseType) {
      case 'camel':
        return toCamelCaseString(flatKey)
      case 'snake':
        return toSnakeCaseString(flatKey)
      case 'kebab':
        return toKebabCaseString(flatKey)
      default:
        throw new Error(`Unknown caseType: ${caseType}`) // Handle unexpected case types
    }
  }

  const convertObject = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map(item => convertObject(item)) // Recursively apply to arrays
    } else if (obj === null || typeof obj !== 'object') {
      return obj // Return non-objects as-is
    }

    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => {
        const convertedKey = convertKey(key) // Apply the desired case conversion
        return [convertedKey, convertObject(value)] // Recursively convert nested objects
      })
    )
  }

  return convertObject(obj) as T // Ensure the return type matches the input type
}
