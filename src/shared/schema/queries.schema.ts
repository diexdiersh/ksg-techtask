import {S} from 'fluent-json-schema'

import {
  QueryFilter,
  QueryGetItems,
  QueryGetUser,
  QueryPagination,
  QueryUserDeposit as QueryUserBuy,
} from '../interfaces/index.js'
import {SchemaCurrency} from './currency.schema.js'
import {DEFAULT} from '../constants/defaults.constants.js'

export const SchemaQueryFilter = S.object<QueryFilter>()
  .prop('order', S.enum(['asc', 'desc']).default('asc'))
  .prop('sortBy', S.string())

export const SchemaQueryPagination = S.object<QueryPagination>()
  .prop('limit', S.number().minimum(0).default(0))
  .prop('skip', S.number().minimum(0).default(0))

export const SchemaGetItems = S.object<QueryGetItems>()
  .prop(
    'appId',
    S.anyOf([S.number(), S.array().items(S.number())]).default(DEFAULT.APP_ID)
  )
  .prop('currency', SchemaCurrency.default(DEFAULT.CURRENCY))
  .extend(SchemaQueryPagination)
  .extend(SchemaQueryFilter)

export const SchemaGetUser = S.object<QueryGetUser>().prop(
  'userId',
  S.string().required()
)

export const SchemaUserDeposit = S.object<QueryUserBuy>()
  .prop('userId', S.string())
  .prop('value', S.number())

export const SchemaUserBuy = S.object<QueryUserBuy>()
  .prop('userId', S.string())
  .prop('value', S.number())
