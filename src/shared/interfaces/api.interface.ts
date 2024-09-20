import {Currency} from '../types/index.js'

export interface ApiItem {
  appId: number
  marketName: string
  currency: Currency
  tradeMinPrice: number
  minPrice: number
}

export interface ApiUser {
  id: string
  balance: number
  createdAt: string
  updatedAt: string
}

export interface ApiTransaction {
  id: string
  userId: string
  type: 'DEPOSIT' | 'BUY'
  value: number
  createdAt: string
}
