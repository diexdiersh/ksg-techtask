import pg from 'pg'
import {FastifyBaseLogger} from 'fastify'

import {TxIsolationLevel} from '../enums/index.js'

// Utility types
type QueryParams<T> = {
  filters?: Partial<T> | Record<string, any>
  limit?: number
  offset?: number
  orderBy?: keyof T | {field: keyof T; direction: 'ASC' | 'DESC'}
}

type QueryBuilderResult = {
  query: string
  values: any[]
}

function buildConditions<T>(filters: Partial<T> | Record<string, any>): {
  conditions: string
  values: any[]
} {
  const keys = Object.keys(filters) as (keyof T)[]
  const values: any[] = []

  const conditions = keys
    .map(key => {
      const value = (filters as any)[key]
      if (Array.isArray(value)) {
        // Handle IN clause for arrays
        const placeholders = value
          .map((_, index) => `$${values.length + index + 1}`)
          .join(', ')
        values.push(...value)
        return `${sanitize(String(key))} IN (${placeholders})`
      } else if (value && typeof value === 'object') {
        // Handle range queries or other complex queries
        const subConditions = Object.entries(value)
          .map(([operator, subValue]) => {
            values.push(subValue)
            return `${sanitize(String(key))} ${operator.toUpperCase()} $${values.length}`
          })
          .join(' AND ')
        return `(${subConditions})`
      } else {
        // Handle simple equality
        values.push(value)
        return `${sanitize(String(key))} = $${values.length}`
      }
    })
    .join(' AND ')

  return {conditions, values}
}

function buildOrderBy<T>(
  orderBy?: keyof T | {field: keyof T; direction: 'ASC' | 'DESC'}
): string {
  if (!orderBy) return ''
  if (typeof orderBy === 'string') {
    return ` ORDER BY ${sanitize(String(orderBy))}`
  } else if (typeof orderBy === 'object') {
    return ` ORDER BY ${sanitize(String(orderBy.field))} ${orderBy.direction}`
  }
  return ''
}

function buildLimitOffset(
  limit?: number,
  offset?: number,
  currentIndex = 0
): {clause: string; values: any[]} {
  let clause = ''
  const values: any[] = []

  if (limit !== undefined) {
    clause += ` LIMIT $${currentIndex + 1}`
    values.push(limit)
    currentIndex += 1
  }

  if (offset !== undefined) {
    clause += ` OFFSET $${currentIndex + 1}`
    values.push(offset)
  }

  return {clause, values}
}

function sanitize(identifier: string): string {
  return identifier.replace(/[^a-zA-Z0-9_]/g, '')
}

export function buildQuery<T>(
  table: string,
  params: QueryParams<T> = {}
): QueryBuilderResult {
  const {filters = {}, limit, offset, orderBy} = params

  // Build WHERE conditions
  const {conditions, values: conditionValues} = buildConditions(filters)

  // Build ORDER BY clause
  const orderClause = buildOrderBy(orderBy)

  // Build LIMIT and OFFSET clauses
  const {clause: limitOffsetClause, values: limitOffsetValues} =
    buildLimitOffset(limit, offset, conditionValues.length)

  // Combine all parts into a full query
  let query = `SELECT * FROM ${sanitize(table)}`
  if (conditions) query += ` WHERE ${conditions}`
  query += orderClause
  query += limitOffsetClause

  const values = [...conditionValues, ...limitOffsetValues]

  return {query, values}
}

export class DbClient {
  constructor(
    private readonly _client: pg.PoolClient,
    private readonly _logger: FastifyBaseLogger
  ) {}

  // Utility function to handle query execution with automatic error handling
  private async executeQuery<T extends pg.QueryResultRow>(
    query: string,
    values: any[]
  ): Promise<T[]> {
    this._logger.trace({query, values}, 'Executing query')

    return this._client
      .query<T>(query, values)
      .then(result => result.rows)
      .catch(err => this.handleError(err, 'Query execution failed'))
  }

  // Centralized error handling function
  private handleError(err: any, context: string): never {
    this._logger.error({err}, `${context}: ${err.message}`)
    throw new Error(`${context} - ${err.message}`)
  }

  // Create a record
  async create<T extends Record<string, any>>(
    table: string,
    data: Required<T>
  ): Promise<T> {
    const keys = Object.keys(data)
    const values = Object.values(data)
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ')

    const query = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`

    return this.executeQuery<T>(query, values).then(rows => rows[0])
  }

  // Read a record by ID
  async findUnique<T extends pg.QueryResultRow>(
    table: string,
    id: number | string
  ): Promise<T | null> {
    const query = `SELECT * FROM ${table} WHERE id = $1 LIMIT 1`

    return this.executeQuery<T>(query, [id]).then(rows =>
      rows.length > 0 ? rows[0] : null
    )
  }

  // Read multiple records with optional filtering, pagination, and sorting
  async findMany<T extends pg.QueryResultRow>(
    table: string,
    params: QueryParams<T> = {}
  ): Promise<T[]> {
    const {query, values} = buildQuery(table, params)
    return this.executeQuery<T>(query, values)
  }

  // Increment a numeric field
  async increment<T extends pg.QueryResultRow>(
    table: string,
    id: number | string,
    field: keyof T,
    amount = 1
  ): Promise<T | null> {
    const query = `UPDATE ${sanitize(table)} SET ${sanitize(String(field))} = ${sanitize(String(field))} + $1 WHERE id = $2 RETURNING *`
    return this.executeQuery<T>(query, [amount, id]).then(rows =>
      rows.length > 0 ? rows[0] : null
    )
  }

  // Decrement a numeric field
  async decrement<T extends pg.QueryResultRow>(
    table: string,
    id: number | string,
    field: keyof T,
    amount = 1
  ): Promise<T | null> {
    const query = `UPDATE ${sanitize(table)} SET ${sanitize(String(field))} = ${sanitize(String(field))} - $1 WHERE id = $2 RETURNING *`
    return this.executeQuery<T>(query, [amount, id]).then(rows =>
      rows.length > 0 ? rows[0] : null
    )
  }

  // Update a record by ID
  async update<T extends Record<string, any>>(
    table: string,
    id: number | string,
    data: Partial<T>
  ): Promise<T | null> {
    const keys = Object.keys(data)
    const values = Object.values(data)
    const updates = keys.map((key, i) => `${key} = $${i + 1}`).join(', ')

    const query = `UPDATE ${table} SET ${updates} WHERE id = $${keys.length + 1} RETURNING *`

    return this.executeQuery<T>(query, [...values, id]).then(rows =>
      rows.length > 0 ? rows[0] : null
    )
  }

  // Delete a record by ID
  async delete<T extends pg.QueryResultRow>(
    table: string,
    id: number | string
  ): Promise<T | null> {
    const query = `DELETE FROM ${table} WHERE id = $1 RETURNING *`

    return this.executeQuery<T>(query, [id]).then(rows =>
      rows.length > 0 ? rows[0] : null
    )
  }

  // Simplified Bulk Insert
  async bulkInsert<T extends Record<string, any>>(
    table: string,
    records: T[]
  ): Promise<T[]> {
    if (records.length === 0) return []

    const keys = Object.keys(records[0])
    const values = records.flatMap(Object.values)

    const placeholders = records
      .map(
        (_, i) =>
          `(${keys.map((_, j) => `$${i * keys.length + j + 1}`).join(', ')})`
      )
      .join(', ')

    const query = `INSERT INTO ${sanitize(table)} (${keys.map(sanitize).join(', ')}) VALUES ${placeholders} RETURNING *`

    return this.executeQuery<T>(query, values)
  }

  // Simplified Bulk Update
  async bulkUpdate<T extends Record<string, any>>(
    table: string,
    records: T[],
    keyField: keyof T
  ): Promise<T[]> {
    if (records.length === 0) return []

    const keys = Object.keys(records[0]).filter(key => key !== keyField)
    const keyValues = records.map(record => record[keyField])
    const values: any[] = []

    const updates = keys
      .map((key, i) => {
        const caseStatements = records
          .map((record, j) => {
            values.push(record[key])
            return `WHEN $${j + 1} THEN $${keyValues.length + i * records.length + j + 1}`
          })
          .join(' ')
        return `${sanitize(key)} = CASE ${sanitize(String(keyField))} ${caseStatements} END`
      })
      .join(', ')

    const whereClause = `${sanitize(String(keyField))} IN (${keyValues.map((_, i) => `$${i + 1}`).join(', ')})`

    const query = `UPDATE ${sanitize(table)} SET ${updates} WHERE ${whereClause} RETURNING *`

    return this.executeQuery<T>(query, [...keyValues, ...values])
  }

  // Simplified Bulk Delete
  async bulkDelete<T extends Record<string, any>>(
    table: string,
    ids: T[keyof T][],
    keyField: keyof T
  ): Promise<T[]> {
    if (ids.length === 0) return []

    const placeholders = ids.map((_, i) => `$${i + 1}`).join(', ')
    const query = `DELETE FROM ${sanitize(table)} WHERE ${sanitize(String(keyField))} IN (${placeholders}) RETURNING *`

    return this.executeQuery<T>(query, ids)
  }

  // Transaction support
  async transaction<T>(
    callback: () => Promise<T>,
    isolationLevel: TxIsolationLevel = TxIsolationLevel.READ_COMMITTED
  ): Promise<T> {
    this._logger.debug('Starting transaction')
    return this._client
      .query(`BEGIN ISOLATION LEVEL ${isolationLevel}`)
      .then(callback)
      .then(result => this._client.query('COMMIT').then(() => result))
      .catch(err =>
        this._client
          .query('ROLLBACK')
          .then(() => this.handleError(err, 'Transaction failed'))
      )
  }
}
