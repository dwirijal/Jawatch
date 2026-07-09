// M5 migration runner. Idempotent — runs library.sql against sb_POSTGRES_URL.
// Usage: bun run db:migrate   (requires sb_POSTGRES_URL in env)
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from '../src/lib/db';

const here = dirname(fileURLToPath(import.meta.url));

async function main() {
  if (!process.env.sb_POSTGRES_URL && !process.env.sb_POSTGRES_PRISMA_URL) {
    console.error('[migrate] sb_POSTGRES_URL not set — aborting.');
    process.exit(1);
  }
  const sql = readFileSync(join(here, '../src/lib/library.sql'), 'utf8');
  await pool.query(sql);
  console.log('[migrate] library tables ensured.');
  await pool.end();
}

main().catch((err) => {
  console.error('[migrate] failed:', err);
  process.exit(1);
});
