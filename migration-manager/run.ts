/* eslint-disable n/no-process-exit */

import pg from 'pg'
import {resolve} from 'path'
import {config} from 'dotenv'

import {MigrationManager} from './migration-manager.js'

config()

const client = new pg.Client({
  host: process.env.PSQL_HOST,
  port: process.env.PSQL_PORT,
  user: process.env.PSQL_USERNAME,
  password: process.env.PSQL_PASSWORD,
  database: process.env.PSQL_DATABASE,
})

async function run() {
  await client.connect()

  const migrationsPath = resolve(process.cwd(), 'migrations')
  const migrationManager = new MigrationManager(client, migrationsPath)

  await migrationManager.init()

  const direction = process.argv[2] || 'up' // Default to 'up' if no direction is provided
  await migrationManager.runMigrations(direction as 'up' | 'down')

  await client.end()
}

run().catch(error => {
  console.error('Migration failed:', error)
  process.exit(1)
})
