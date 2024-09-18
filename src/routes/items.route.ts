import {FastifyInstance, FastifyPluginOptions} from 'fastify'

async function items(fastify: FastifyInstance, _: FastifyPluginOptions) {
  fastify.get('/items', async (_, __) => {
    return {hello: 'world'}
  })
}

export default items
