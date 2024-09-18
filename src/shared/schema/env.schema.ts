import {S} from 'fluent-json-schema'

import {Env} from '../interfaces/index.js'
import {DEFAULT} from '../constants/index.js'

export const SchemaEnv = S.object<Env>()
  .prop('GRACE_CLOSE_DELAY', S.number().default(DEFAULT.GRACE_CLOSE_DELAY))
  .prop('PORT', S.number().default(DEFAULT.PORT))
