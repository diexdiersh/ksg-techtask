import pg from 'pg'

export default {
  up: async (client: pg.Client) => {
    await client.query(`
      -- Create the tx_type enum type
      CREATE TYPE tx_type AS ENUM ('DEPOSIT', 'BUY');

      -- Create the transactions table
      CREATE TABLE transactions (
        id UUID NOT NULL DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL,
        type tx_type NOT NULL,
        value DECIMAL(20, 8) NOT NULL,
        created_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        
        CONSTRAINT transactions_pkey PRIMARY KEY (id)
      );

      -- Add the foreign key constraint for user_id
      ALTER TABLE transactions
      ADD CONSTRAINT transactions_user_id_fkey
      FOREIGN KEY (user_id)
      REFERENCES users(id)
      ON DELETE RESTRICT
      ON UPDATE CASCADE;
    `)
  },

  down: async (client: pg.Client) => {
    await client.query(`
      -- Drop the transactions table
      DROP TABLE IF EXISTS transactions;

      -- Drop the tx_type enum type
      DROP TYPE IF EXISTS tx_type;
    `)
  },
}
