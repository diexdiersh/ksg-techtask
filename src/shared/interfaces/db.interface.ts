export interface DbUser {
  id: string //uuid
  balance: number //decimal
  created_at: string //timestampz
  updated_at: string //timestampz
}

export interface DbTransaction {
  id: string // uuid
  user_id: string // uuid
  type: 'DEPOSIT' | 'BUY'
  value: number //decimal
  created_at: string //timestampz
}
