import {readdirSync} from 'fs'
import {join} from 'path'
import pg from 'pg'

// Custom error class for migration errors
class MigrationError extends Error {
  constructor(
    public migrationName: string,
    public direction: 'up' | 'down',
    public originalError: Error
  ) {
    super(`Error during ${direction} migration: ${migrationName}`)
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export interface Migration {
  up: (client: pg.Client) => Promise<void>
  down: (client: pg.Client) => Promise<void>
}

export class MigrationManager {
  constructor(
    private client: pg.Client,
    private migrationsPath: string
  ) {}

  private log(
    level: 'INFO' | 'SUCCESS' | 'ERROR' | 'FATAL',
    message: string,
    error?: Error
  ): void {
    const timestamp = new Date().toISOString()
    const logMessage = `[${timestamp}] [${level}] ${message}`

    console.log(logMessage)

    if (error) {
      console.error(`[${level}] Error: ${error.message}`)
      if ('code' in error)
        console.error(`[${level}] SQL State Code: ${(error as any).code}`)
      if ('detail' in error)
        console.error(`[${level}] Detail: ${(error as any).detail}`)
      if ('hint' in error)
        console.error(`[${level}] Hint: ${(error as any).hint}`)
      console.error(`[${level}] Stack Trace:\n${error.stack}`)
    }
  }

  async init(): Promise<void> {
    try {
      await this.client.query(`
        CREATE TABLE IF NOT EXISTS migrations (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) UNIQUE NOT NULL,
          executed_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `)
    } catch (error) {
      this.log(
        'ERROR',
        'Failed to initialize migrations table.',
        error as Error
      )
      throw new MigrationError('init', 'up', error as Error)
    }
  }

  async runMigrations(direction: 'up' | 'down'): Promise<void> {
    const files = readdirSync(this.migrationsPath)
      .filter(file => file.endsWith('.ts'))
      .sort()
    if (direction === 'down') files.reverse()

    for (const file of files) {
      const migrationName = file.replace('.ts', '')

      const result = await this.client.query(
        'SELECT 1 FROM migrations WHERE name = $1',
        [migrationName]
      )
      const migrationExists = result.rowCount && result.rowCount > 0

      if (
        (direction === 'up' && migrationExists) ||
        (direction === 'down' && !migrationExists)
      ) {
        this.log(
          'INFO',
          `Migration ${migrationName} ${direction === 'up' ? 'already applied' : 'not applied'}.`
        )
        continue
      }

      this.log('INFO', `Starting ${direction} migration: ${migrationName}`)
      await this.client.query('BEGIN')

      try {
        const migrationModule = await import(join(this.migrationsPath, file))
        const migration: Migration = migrationModule.default

        await migration[direction](this.client)

        if (direction === 'up') {
          await this.client.query('INSERT INTO migrations (name) VALUES ($1)', [
            migrationName,
          ])
        } else {
          await this.client.query('DELETE FROM migrations WHERE name = $1', [
            migrationName,
          ])
        }

        await this.client.query('COMMIT')
        this.log(
          'SUCCESS',
          `Migration ${migrationName} ${direction} completed successfully.`
        )
      } catch (error) {
        await this.client.query('ROLLBACK')
        this.log(
          'ERROR',
          `Migration ${migrationName} ${direction} failed and was rolled back.`,
          error as Error
        )
        throw new MigrationError(migrationName, direction, error as Error)
      }
    }
  }
}
