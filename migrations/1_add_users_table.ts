import pg from 'pg'

export default {
  up: async (client: pg.Client) => {
    await client.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      CREATE TABLE users (
        id UUID NOT NULL DEFAULT uuid_generate_v4(),
        balance DECIMAL(20, 8) NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        
        CONSTRAINT users_pkey PRIMARY KEY (id)
      );
    `)
  },

  down: async (client: pg.Client) => {
    await client.query(`
      DROP TABLE IF EXISTS users;

      DROP EXTENSION IF EXISTS "uuid-ossp";
    `)
  },
}
