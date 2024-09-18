import {convertCase} from './convert-case.util.js' // Adjust this to your actual file path

describe('convertCase Utility Function', () => {
  const obj = {
    first_name: 'John',
    lastName: 'Doe',
    contact_info: {
      phoneNumber: '1234567890',
      email_address: 'john.doe@example.com',
    },
    hobbies: ['coding', 'reading'],
  }

  const expectedSnakeCase = {
    first_name: 'John',
    last_name: 'Doe',
    contact_info: {
      phone_number: '1234567890',
      email_address: 'john.doe@example.com',
    },
    hobbies: ['coding', 'reading'],
  }

  // const expectedKebabCase = {
  //   first-name: 'John',
  //   last-name: 'Doe',
  //   contact-info: {
  //     phone-number: '1234567890',
  //     email-address: 'john.doe@example.com',
  //   },
  //   hobbies: ['coding', 'reading'],
  // };

  const expectedCamelCase = {
    firstName: 'John',
    lastName: 'Doe',
    contactInfo: {
      phoneNumber: '1234567890',
      emailAddress: 'john.doe@example.com',
    },
    hobbies: ['coding', 'reading'],
  }

  it('should convert object keys to camelCase', () => {
    const result = convertCase(obj, 'camel')
    expect(result).toEqual(expectedCamelCase)
  })

  it('should convert object keys to snake_case', () => {
    const result = convertCase(obj, 'snake')
    expect(result).toEqual(expectedSnakeCase)
  })

  it('should convert object keys to kebab-case', () => {
    const result = convertCase(obj, 'kebab')
    expect(result).toEqual(expectedKebabCase)
  })

  it('should handle nested objects and arrays', () => {
    const nestedObj = {
      user_data: {
        user_name: 'JaneDoe',
        account_info: {
          balance: 1000,
          recent_transactions: [
            {transaction_id: 'tx_1234', amount: 100},
            {transaction_id: 'tx_5678', amount: 200},
          ],
        },
      },
    }

    const expectedCamelNested = {
      userData: {
        userName: 'JaneDoe',
        accountInfo: {
          balance: 1000,
          recentTransactions: [
            {transactionId: 'tx_1234', amount: 100},
            {transactionId: 'tx_5678', amount: 200},
          ],
        },
      },
    }

    const result = convertCase(nestedObj, 'camel')
    expect(result).toEqual(expectedCamelNested)
  })

  it('should return the input as is for non-object types', () => {
    expect(convertCase(null, 'camel')).toBe(null)
    expect(convertCase(42, 'snake')).toBe(42)
    expect(convertCase('test', 'kebab')).toBe('test')
  })
})
