/* eslint-disable no-var */

import AutoLoad from '@fastify/autoload'
import Env from '@fastify/env'
import fastifyPostgres from '@fastify/postgres'
import fastifyRedis from '@fastify/redis'
import {FastifyInstance, FastifyPluginOptions} from 'fastify'
import {dirname, join} from 'path'
import {fileURLToPath} from 'url'

import {SchemaEnv} from './shared/schema/index.js'

var __filename = fileURLToPath(import.meta.url)
var __dirname = dirname(__filename)

export default async function app(
  fastify: FastifyInstance,
  opts: FastifyPluginOptions
): Promise<void> {
  await fastify.register(Env, {
    schema: SchemaEnv.valueOf(),
    dotenv: true,
  })

  await fastify.register(fastifyRedis, {
    host: fastify.config.REDIS_HOST,
    port: fastify.config.REDIS_PORT,
    db: fastify.config.REDIS_DB,
    closeClient: true,
    logLevel: fastify.config.LOG_LEVEL,
  })

  await fastify.register(fastifyPostgres, {
    host: fastify.config.PSQL_HOST,
    port: fastify.config.PSQL_PORT,
    user: fastify.config.PSQL_USERNAME,
    password: fastify.config.PSQL_PASSWORD,
    database: fastify.config.PSQL_DATABASE,
    logLevel: fastify.config.LOG_LEVEL,
  })

  await fastify.register(AutoLoad, {
    dir: join(__dirname, 'plugins'),
    options: Object.assign({}, opts),
  })

  await fastify.register(AutoLoad, {
    dir: join(__dirname, 'routes'),
    options: Object.assign({prefix: '/api/v1'}, opts),
  })
}
