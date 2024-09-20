import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyReply,
  FastifyRequest,
} from 'fastify'

import {
  ApiUser,
  QueryGetUser,
  QueryUserDeposit,
} from '../shared/interfaces/index.js'
import {
  SchemaApiUser,
  SchemaUserBuy,
  SchemaGetUser,
} from '../shared/schema/index.js'

interface UserError {
  error: string
}

async function users(fastify: FastifyInstance, _: FastifyPluginOptions) {
  fastify.route({
    method: 'GET',
    url: '/user',
    handler: onUser,
    schema: {
      querystring: SchemaGetUser,
      response: {
        200: SchemaApiUser,
      },
    },
  })

  fastify.route({
    method: 'POST',
    url: '/user/register',
    handler: onUserRegister,
  })

  fastify.route({
    method: 'POST',
    url: '/user/deposit',
    handler: onUserDeposit,
    schema: {
      querystring: SchemaUserBuy,
      response: {
        201: SchemaApiUser,
      },
    },
  })

  fastify.route({
    method: 'POST',
    url: '/user/buy',
    handler: onUserBuy,
    schema: {
      querystring: SchemaUserBuy,
      response: {
        201: SchemaApiUser,
      },
    },
  })

  async function onUser(
    req: FastifyRequest<{Querystring: QueryGetUser}>,
    reply: FastifyReply
  ): Promise<ApiUser | UserError> {
    const user = await fastify.users.getUser(req.query)

    if (!user) {
      reply.status(404)

      return {error: 'User not found!'}
    }

    return user
  }

  async function onUserRegister(
    _: FastifyRequest,
    __: FastifyReply
  ): Promise<ApiUser> {
    return fastify.users.addUser()
  }

  async function onUserDeposit(
    req: FastifyRequest<{Querystring: QueryUserDeposit}>,
    reply: FastifyReply
  ): Promise<ApiUser | UserError> {
    const user = await fastify.users.getUser(req.query)

    if (!user) {
      reply.status(404)

      return {error: 'User not found!'}
    }

    const updatedUser = await fastify.users.deposit(req.query)

    if (!updatedUser) {
      return {error: 'User deposit failed!'}
    }

    return updatedUser
  }

  async function onUserBuy(
    req: FastifyRequest<{Querystring: QueryUserDeposit}>,
    reply: FastifyReply
  ): Promise<ApiUser | UserError> {
    const user = await fastify.users.getUser(req.query)

    if (!user) {
      reply.status(404)

      return {error: 'User not found!'}
    }

    const updatedUser = await fastify.users.buy(req.query)

    if (!updatedUser) {
      return {error: 'User buy failed!'}
    }

    return updatedUser
  }
}

export default users
