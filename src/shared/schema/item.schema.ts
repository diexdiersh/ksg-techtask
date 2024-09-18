import {S} from 'fluent-json-schema'

import {SkinportItem} from '../interfaces/index.js'
import {SchemaCurrency} from './currency.schema.js'

export const SchemaSkinportItem = S.object<SkinportItem>()
  .prop('market_hash_name', S.string().required())
  .prop('currency', SchemaCurrency.required())
  .prop('min_price', S.anyOf([S.number(), S.null()]))
