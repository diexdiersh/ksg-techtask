// Utility function to convert strings to camelCase
function toCamelCaseString(str: string): string {
  return str.replace(/([-_][a-z])/g, group => group[1].toUpperCase())
}

// Utility function to convert strings to snake_case
function toSnakeCaseString(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
}

// Utility function to convert strings to kebab-case
function toKebabCaseString(str: string): string {
  return str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)
}

// Main function to convert the object's keys to the desired case
export function convertCase(
  obj: unknown,
  caseType: 'camel' | 'snake' | 'kebab'
): unknown {
  if (Array.isArray(obj)) {
    return obj.map(item => convertCase(item, caseType)) // Recursively apply to arrays
  } else if (obj === null || typeof obj !== 'object') {
    return obj // Return non-objects as-is
  }

  // Determine the conversion function based on the caseType argument
  const convertKey = (key: string): string => {
    switch (caseType) {
      case 'camel':
        return toCamelCaseString(key)
      case 'snake':
        return toSnakeCaseString(key)
      case 'kebab':
        return toKebabCaseString(key)
      default:
        return key // Fallback to the original key if an unknown caseType is passed
    }
  }

  // Recursively convert keys of the object
  return Object.fromEntries(
    Object.entries(obj as Record<string, unknown>).map(([key, value]) => {
      const convertedKey = convertKey(key) // Apply the desired case conversion
      return [convertedKey, convertCase(value, caseType)] // Recursively convert nested objects
    })
  )
}

// Usage example
const obj = {
  first_name: 'John',
  lastName: 'Doe',
  contact_info: {
    phoneNumber: '1234567890',
    email_address: 'john.doe@example.com',
  },
  hobbies: ['coding', 'reading'],
}

// Convert to snake_case
const snakeCaseObj = convertCase(obj, 'snake')
console.log(snakeCaseObj)

// Convert to kebab-case
const kebabCaseObj = convertCase(obj, 'kebab')
console.log(kebabCaseObj)

// Convert to camelCase
const camelCaseObj = convertCase(obj, 'camel')
console.log(camelCaseObj)
