import {S} from 'fluent-json-schema'

import {Env} from '../interfaces/index.js'
import {DEFAULT} from '../constants/index.js'

export const SchemaEnv = S.object<Env>()
  // server env
  .prop('NODE_ENV', S.string().required())
  .prop('GRACE_CLOSE_DELAY', S.number().default(DEFAULT.GRACE_CLOSE_DELAY))
  .prop('PORT', S.number().default(DEFAULT.PORT))
  .prop('HOST', S.string().default(DEFAULT.HOST))
  .prop('LOG_LEVEL', S.string().default(DEFAULT.LOG_LEVEL))
  .prop('PLUGIN_TIMEOUT', S.number().default(DEFAULT.PLUGIN_TIMEOUT))
  .prop('USE_SWAGGER', S.boolean().default(DEFAULT.USE_SWAGGER))
  // skinport env
  .prop('SKINPORT_API_URL', S.string().required())
  .prop(
    'SKINPORT_CACHE_TTL_MS',
    S.number().default(DEFAULT.SKINPORT_CACHE_TTL_MS)
  )
  .prop(
    'REQUEST_CACHE_TTL_SEC',
    S.number().default(DEFAULT.REQUEST_CACHE_TTL_SEC)
  )
  // redis env
  .prop('REDIS_HOST', S.string().default(DEFAULT.REDIS_HOST))
  .prop('REDIS_PORT', S.number().default(DEFAULT.REDIS_PORT))
  .prop('REDIS_DB', S.number().default(DEFAULT.REDIS_DB))
  // postgresql env
  .prop('PSQL_HOST', S.string().required())
  .prop('PSQL_PORT', S.number().required())
  .prop('PSQL_USERNAME', S.string().required())
  .prop('PSQL_PASSWORD', S.string().required())
  .prop('PSQL_DATABASE', S.string().required())
