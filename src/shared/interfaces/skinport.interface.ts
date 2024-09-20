import {Currency} from '../types/index.js'

export interface SkinportItem {
  market_hash_name: string
  currency: Currency
  min_price: number | null
}

export interface ItemParam {
  appId: number
  tradable?: boolean
  currency?: Currency
}
