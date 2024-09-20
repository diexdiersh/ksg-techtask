import {S} from 'fluent-json-schema'

import {ApiItem, ApiUser} from '../interfaces/index.js'
import {SchemaCurrency} from './currency.schema.js'

export const SchemaApiItem = S.object<ApiItem>()
  .prop('appId', S.number())
  .prop('currency', SchemaCurrency)
  .prop('marketName', S.string())
  .prop('minPrice', S.number())
  .prop('tradeMinPrice', S.number())

export const SchemaApiUser = S.object<ApiUser>()
  .prop('id', S.string())
  .prop('balance', S.number())
  .prop('createdAt', S.string())
  .prop('updatedAt', S.string())
