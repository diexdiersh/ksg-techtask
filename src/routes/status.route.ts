import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyRequest,
  FastifyReply,
} from 'fastify'
import {S} from 'fluent-json-schema'

interface Schema {
  status: string
}

const schema = S.object<Schema>().prop('status', S.string().required())

async function status(
  fastify: FastifyInstance,
  _: FastifyPluginOptions
): Promise<void> {
  fastify.route({
    method: 'GET',
    url: '/status',
    handler: onStatus,
    schema: {
      response: {
        200: schema,
      },
    },
  })

  async function onStatus(
    _: FastifyRequest,
    __: FastifyReply
  ): Promise<Schema> {
    return {status: 'ok'}
  }
}

export default status
