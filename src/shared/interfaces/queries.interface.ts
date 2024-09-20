import {Currency} from '../types/index.js'

export interface QueryFilter {
  sortBy?: string
  order?: 'asc' | 'desc'
}

export interface QueryPagination {
  limit?: number
  skip?: number
}

export interface QueryGetItems extends QueryPagination, QueryFilter {
  appId: number | number[]
  currency: Currency
}

export interface QueryGetUser {
  userId: string
}

export interface QueryUserDeposit {
  userId: string
  value: number
}

export interface QueryUserBuy {
  userId: string
  value: number
}
