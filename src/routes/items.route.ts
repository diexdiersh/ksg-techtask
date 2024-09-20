import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyReply,
  FastifyRequest,
  HookHandlerDoneFunction,
} from 'fastify'
import {S} from 'fluent-json-schema'

import {ApiItem, QueryGetItems} from '../shared/interfaces/index.js'
import {SchemaApiItem, SchemaGetItems} from '../shared/schema/index.js'
import {Replace} from '../shared/types/index.js'

const responseSchema = S.array().items(SchemaApiItem)

async function items(fastify: FastifyInstance, _: FastifyPluginOptions) {
  fastify.route({
    method: 'GET',
    url: '/items',
    preValidation: preValidate,
    handler: onItems,
    schema: {
      querystring: SchemaGetItems,
      response: {
        200: responseSchema,
      },
    },
  })

  function preValidate(
    req: FastifyRequest<{
      Querystring: Replace<QueryGetItems, unknown>
    }>,
    _: FastifyReply,
    done: HookHandlerDoneFunction
  ): void {
    const {appId} = req.query
    if (appId === undefined) {
      return done()
    }

    if (typeof appId === 'string') {
      if (appId.includes(',')) {
        req.query.appId = appId.split(',').map(v => Number.parseInt(v))
      } else {
        req.query.appId = Number.parseInt(appId)
      }
    }

    return done()
  }

  async function onItems(
    req: FastifyRequest<{Querystring: QueryGetItems; Reply: ApiItem[]}>,
    reply: FastifyReply
  ): Promise<ApiItem[]> {
    const items = await fastify.items.getItems(req.query)

    reply.header('Cache-Control', 'public, max-age=60')

    return items
  }
}

export default items
