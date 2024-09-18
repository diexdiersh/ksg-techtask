/* eslint-disable no-var */

import AutoLoad from '@fastify/autoload'
import Env from '@fastify/env'
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
  })

  // await fastify.register(AutoLoad, {
  //   dir: join(__dirname, 'plugins'),
  //   options: Object.assign({}, opts),
  // })

  await fastify.register(AutoLoad, {
    dir: join(__dirname, 'routes'),
    options: Object.assign({}, opts),
  })
}
