import {FastifyInstance, FastifyPluginOptions} from 'fastify'
import fastifyPlugin from 'fastify-plugin'

import {TxIsolationLevel} from '../shared/enums/index.js'
import {
  ApiUser,
  DbTransaction,
  DbUser,
  QueryGetUser,
  QueryUserBuy,
  QueryUserDeposit,
} from '../shared/interfaces/index.js'

declare module 'fastify' {
  interface FastifyInstance {
    users: UsersService
  }
}

function dbToApi(user: DbUser): ApiUser {
  return {
    id: user.id,
    balance: user.balance,
    createdAt: user.updated_at,
    updatedAt: user.updated_at,
  }
}

class UsersService {
  constructor(private readonly _fastify: FastifyInstance) {}

  async getUser(query: QueryGetUser): Promise<ApiUser | undefined> {
    const {userId} = query

    const user = await this._fastify.dbclient.findUnique<DbUser>(
      'users',
      userId
    )

    if (!user) {
      return undefined
    }

    return dbToApi(user)
  }

  async addUser(): Promise<ApiUser> {
    const user = await this._fastify.dbclient.create<DbUser>('users', {
      balance: 0,
    } as DbUser)

    return dbToApi(user)
  }

  async deposit(query: QueryUserDeposit): Promise<ApiUser | undefined> {
    let user: DbUser | null = null

    await this._fastify.dbclient.transaction(async () => {
      await this._fastify.dbclient.create<DbTransaction>('transactions', {
        user_id: query.userId,
        type: 'DEPOSIT',
        value: query.value,
      } as DbTransaction)

      user = await this._fastify.dbclient.increment<DbUser>(
        'users',
        query.userId,
        'balance',
        query.value
      )
    })

    if (!user) {
      return undefined
    }

    return dbToApi(user)
  }

  async buy(query: QueryUserBuy): Promise<ApiUser | undefined> {
    let user: DbUser | null = null

    await this._fastify.dbclient.transaction(async () => {
      await this._fastify.dbclient.create<DbTransaction>('transactions', {
        user_id: query.userId,
        type: 'BUY',
        value: query.value,
      } as DbTransaction)

      user = await this._fastify.dbclient.decrement<DbUser>(
        'users',
        query.userId,
        'balance',
        query.value
      )

      if (user && user?.balance < 0) {
        throw new Error("User balance can't be less than zero!")
      }
    }, TxIsolationLevel.SERIALIZABLE)

    if (!user) {
      return undefined
    }

    return dbToApi(user)
  }
}

async function users(
  fastify: FastifyInstance,
  _: FastifyPluginOptions
): Promise<void> {
  const itemsService = new UsersService(fastify)
  fastify.decorate(users.name, itemsService)
}

export default fastifyPlugin(users, {
  name: users.name,
  dependencies: ['dbclient'],
})
