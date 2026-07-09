import { Pool } from 'pg';

// Supabase's pooler serves a chain rooted at Supabase's own CA, which isn't in the
// system trust store. We pin that CA (from env, works identically local + Vercel) and
// keep full verification ON. Get the PEM from:
// https://supabase.com/dashboard/project/_/settings/database (SSL cert).
// NOTE: an `ssl` object and `sslmode=require` in the connection string conflict — pg/Bun
// ignores the object when sslmode is present, so we strip sslmode and let the object govern.
const caCert = process.env.sb_POSTGRES_CA_CERT?.replace(/\\n/g, '\n');
const rawConn = process.env.sb_POSTGRES_URL || process.env.sb_POSTGRES_PRISMA_URL;
const connectionString = caCert
  ? rawConn?.replace(/([?&])sslmode=[a-z-]+&?/i, (m, p) => (m.endsWith('&') ? p : '')).replace(/[?&]$/, '')
  : rawConn;
const ssl = caCert ? { ca: caCert, rejectUnauthorized: true } : undefined;

export const pool = new Pool({ connectionString, ssl });
