import {SKINPORT_CURRENCIES} from '../constants/index.js'

export interface SkinportItem {
  market_hash_name: string
  currency: (typeof SKINPORT_CURRENCIES)[number]
  min_price: number | null
}

export interface Item {
  marketHashName: string
  currency: (typeof SKINPORT_CURRENCIES)[number]
  minPrice: number | null
}
