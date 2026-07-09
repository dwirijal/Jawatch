import { Pool } from 'pg';

export const pool = new Pool({
  connectionString: process.env.sb_POSTGRES_URL || process.env.sb_POSTGRES_PRISMA_URL,
});
