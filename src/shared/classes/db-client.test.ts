import pg from 'pg'
import {DbClient} from './db-client.class.js'
import {FastifyBaseLogger} from 'fastify'

// Mock the pg.Client
jest.mock('pg', () => {
  const mClient = {
    query: jest.fn(),
    connect: jest.fn(),
    release: jest.fn(),
    end: jest.fn(),
  }
  return {Client: jest.fn(() => mClient)}
})

// Mock the FastifyBaseLogger
const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  trace: jest.fn(),
  fatal: jest.fn(),
  child: jest.fn(() => mockLogger),
} as unknown as FastifyBaseLogger

describe('DbClient', () => {
  let client: pg.Client
  let dbClient: DbClient

  beforeEach(() => {
    client = new pg.Client() // Use the mocked Client constructor
    dbClient = new DbClient(client, mockLogger)
  })

  afterEach(() => {
    jest.clearAllMocks() // Resets the state of all mocks
  })

  test('should create a record', async () => {
    const mockData = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      age: 30,
    }
    client.query.mockResolvedValueOnce({rows: [mockData]})

    const result = await dbClient.create('users', mockData)

    expect(client.query).toHaveBeenCalledTimes(1)
    expect(client.query).toHaveBeenCalledWith(
      'INSERT INTO users (id, name, email, age) VALUES ($1, $2, $3, $4) RETURNING *',
      [1, 'John Doe', 'john@example.com', 30]
    )
    expect(result).toEqual(mockData)
  })

  test('should find a record by ID', async () => {
    const mockData = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      age: 30,
    }
    client.query.mockResolvedValueOnce({rows: [mockData]})

    const result = await dbClient.findUnique('users', 1)

    expect(client.query).toHaveBeenCalledWith(
      'SELECT * FROM users WHERE id = $1 LIMIT 1',
      [1]
    )
    expect(result).toEqual(mockData)
  })

  test('should return null if no record is found by ID', async () => {
    client.query.mockResolvedValueOnce({rows: []})

    const result = await dbClient.findUnique('users', 1)

    expect(client.query).toHaveBeenCalledWith(
      'SELECT * FROM users WHERE id = $1 LIMIT 1',
      [1]
    )
    expect(result).toBeNull()
  })

  test('should find many records with filtering, pagination, and sorting', async () => {
    const mockData = [
      {id: 1, name: 'John Doe', email: 'john@example.com', age: 30},
      {id: 2, name: 'Jane Doe', email: 'jane@example.com', age: 25},
    ]
    client.query.mockResolvedValueOnce({rows: mockData})

    const result = await dbClient.findMany('users', {
      filters: {age: 30},
      limit: 10,
      offset: 0,
      orderBy: 'name',
    })

    expect(client.query).toHaveBeenCalledWith(
      'SELECT * FROM users WHERE age = $1 ORDER BY name LIMIT $2 OFFSET $3',
      [30, 10, 0]
    )
    expect(result).toEqual(mockData)
  })

  test('should return all records when no filters are provided', async () => {
    const mockData = [
      {id: 1, name: 'John Doe', email: 'john@example.com', age: 30},
      {id: 2, name: 'Jane Doe', email: 'jane@example.com', age: 25},
    ]
    client.query.mockResolvedValueOnce({rows: mockData})

    const result = await dbClient.findMany('users')

    expect(client.query).toHaveBeenCalledWith('SELECT * FROM users', [])
    expect(result).toEqual(mockData)
  })

  test('should return empty array if no records match filters', async () => {
    client.query.mockResolvedValueOnce({rows: []})

    const result = await dbClient.findMany('users', {
      filters: {age: 100},
    })

    expect(client.query).toHaveBeenCalledWith(
      'SELECT * FROM users WHERE age = $1',
      [100]
    )
    expect(result).toEqual([])
  })

  test('should update a record by ID', async () => {
    const mockData = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      age: 31,
    }
    client.query.mockResolvedValueOnce({rows: [mockData]})

    const result = await dbClient.update('users', 1, {age: 31})

    expect(client.query).toHaveBeenCalledWith(
      'UPDATE users SET age = $1 WHERE id = $2 RETURNING *',
      [31, 1]
    )
    expect(result).toEqual(mockData)
  })

  test('should delete a record by ID', async () => {
    const mockData = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      age: 30,
    }
    client.query.mockResolvedValueOnce({rows: [mockData]})

    const result = await dbClient.delete('users', 1)

    expect(client.query).toHaveBeenCalledWith(
      'DELETE FROM users WHERE id = $1 RETURNING *',
      [1]
    )
    expect(result).toEqual(mockData)
  })

  test('should bulk insert records', async () => {
    const mockData = [
      {id: 1, name: 'John Doe', email: 'john@example.com'},
      {id: 2, name: 'Jane Doe', email: 'jane@example.com'},
    ]
    client.query.mockResolvedValueOnce({rows: mockData})

    const result = await dbClient.bulkInsert('users', mockData)

    expect(client.query).toHaveBeenCalledTimes(1)
    expect(client.query).toHaveBeenCalledWith(
      'INSERT INTO users (id, name, email) VALUES ($1, $2, $3), ($4, $5, $6) RETURNING *',
      [1, 'John Doe', 'john@example.com', 2, 'Jane Doe', 'jane@example.com']
    )
    expect(result).toEqual(mockData)
  })

  test('should bulk update records', async () => {
    const mockData = [
      {id: 1, name: 'John Smith', email: 'john.smith@example.com'},
      {id: 2, name: 'Jane Smith', email: 'jane.smith@example.com'},
    ]
    client.query.mockResolvedValueOnce({rows: mockData})

    const result = await dbClient.bulkUpdate('users', mockData, 'id')

    expect(client.query).toHaveBeenCalledTimes(1)
    expect(client.query).toHaveBeenCalledWith(
      'UPDATE users SET name = CASE id WHEN $1 THEN $3 WHEN $2 THEN $4 END, email = CASE id WHEN $1 THEN $5 WHEN $2 THEN $6 END WHERE id IN ($1, $2) RETURNING *',
      [
        1,
        2,
        'John Smith',
        'Jane Smith',
        'john.smith@example.com',
        'jane.smith@example.com',
      ]
    )
    expect(result).toEqual(mockData)
  })

  test('should bulk delete records', async () => {
    const mockData = [
      {id: 1, name: 'John Doe', email: 'john@example.com'},
      {id: 2, name: 'Jane Doe', email: 'jane@example.com'},
    ]
    client.query.mockResolvedValueOnce({rows: mockData})

    const idsToDelete = [1, 2]
    const result = await dbClient.bulkDelete('users', idsToDelete, 'id')

    expect(client.query).toHaveBeenCalledTimes(1)
    expect(client.query).toHaveBeenCalledWith(
      'DELETE FROM users WHERE id IN ($1, $2) RETURNING *',
      [1, 2]
    )
    expect(result).toEqual(mockData)
  })

  test('should handle transactions', async () => {
    const mockResult = 'Transaction Successful'
    client.query.mockResolvedValueOnce({}) // For BEGIN
    client.query.mockResolvedValueOnce({}) // For COMMIT

    const result = await dbClient.transaction(async () => {
      return mockResult
    })

    expect(client.query).toHaveBeenNthCalledWith(1, 'BEGIN')
    expect(client.query).toHaveBeenNthCalledWith(2, 'COMMIT')
    expect(result).toBe(mockResult)
  })

  test('should rollback a transaction on error', async () => {
    client.query.mockResolvedValueOnce({}) // For BEGIN
    client.query.mockRejectedValueOnce(new Error('Transaction Error')) // For the operation

    await expect(
      dbClient.transaction(async () => {
        throw new Error('Transaction Error')
      })
    ).rejects.toThrow('Transaction Error')

    expect(client.query).toHaveBeenNthCalledWith(1, 'BEGIN')
    expect(client.query).toHaveBeenNthCalledWith(2, 'ROLLBACK')
    expect(client.query).not.toHaveBeenCalledWith('COMMIT')
  })
})
