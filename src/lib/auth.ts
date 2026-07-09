import { betterAuth } from 'better-auth';
import { pool } from './db';

const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

export const auth = betterAuth({
  // better-auth's Kysely adapter accepts a pg Pool directly (detects `connect` -> PostgresDialect).
  database: pool,
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: { enabled: true, requireEmailVerification: false },
  // ponytail: Google is env-gated; when unset, socialProviders is empty -> no OAuth UI. Add more providers when needed.
  socialProviders: googleEnabled
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
      }
    : {},
});
