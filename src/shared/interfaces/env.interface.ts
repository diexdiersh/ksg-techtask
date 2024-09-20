import {LogLevel} from 'fastify'

export interface Env {
  // server env
  NODE_ENV: string
  GRACE_CLOSE_DELAY: number
  PORT: number
  HOST: string
  LOG_LEVEL: LogLevel
  PLUGIN_TIMEOUT: number
  USE_SWAGGER: boolean
  // plugins env
  SKINPORT_API_URL: string
  REQUEST_CACHE_TTL_SEC: number
  SKINPORT_CACHE_TTL_MS: number
  // redis env
  REDIS_HOST: string
  REDIS_PORT: number
  REDIS_DB: number
  // postgresql env
  PSQL_HOST: string
  PSQL_PORT: number
  PSQL_USERNAME: string
  PSQL_PASSWORD: string
  PSQL_DATABASE: string
}
