import fastifySwagger, {SwaggerOptions} from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import {FastifyInstance, FastifyPluginOptions} from 'fastify'
import fp from 'fastify-plugin'
import {readFileSync} from 'fs'
import {resolve} from 'path'

const {version} = JSON.parse(
  readFileSync(resolve(process.cwd(), 'package.json'), 'utf8')
)

const swaggerOptions: SwaggerOptions = {
  openapi: {
    openapi: '3.0.0',
    info: {
      title: 'Skin market API',
      description: 'Skin market API documentation',
      version,
    },
  },
}

async function swagger(
  fastify: FastifyInstance,
  _: FastifyPluginOptions
): Promise<void> {
  if (
    !fastify.config.USE_SWAGGER ||
    fastify.config.NODE_ENV !== 'development'
  ) {
    return
  }

  fastify.register(fastifySwagger, swaggerOptions)
  fastify.register(fastifySwaggerUi, {routePrefix: '/docs'})
}

export default fp(swagger, {name: swagger.name})
