import { Pool } from 'pg';

const caCert = process.env.sb_POSTGRES_CA_CERT?.replace(/\\n/g, '\n');
const rawConn = process.env.sb_POSTGRES_URL || process.env.sb_POSTGRES_PRISMA_URL;
const connectionString = caCert
  ? rawConn?.replace(/([?&])sslmode=[a-z-]+&?/i, (m) => (m.endsWith('&') ? '' : '')).replace(/[?&]$/, '')
  : rawConn;
const ssl = caCert ? { ca: caCert, rejectUnauthorized: true } : undefined;

export const pool = new Pool({ connectionString, ssl });
