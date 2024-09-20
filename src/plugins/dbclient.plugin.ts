import {FastifyInstance, FastifyPluginOptions} from 'fastify'
import fp from 'fastify-plugin'

import {DbClient} from '../shared/classes/index.js'

declare module 'fastify' {
  interface FastifyInstance {
    dbclient: DbClient
  }
}

async function dbclient(
  fastify: FastifyInstance,
  __: FastifyPluginOptions
): Promise<void> {
  const client = await fastify.pg.connect()

  const dbClient = new DbClient(client, fastify.log)

  fastify.decorate(dbclient.name, dbClient)
}

export default fp(dbclient, {name: dbclient.name})
