import {S} from 'fluent-json-schema'

import {SKINPORT_CURRENCIES} from '../constants/currencies.constant.js'

export const SchemaCurrency = S.string().enum([...SKINPORT_CURRENCIES])
