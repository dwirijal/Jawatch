import { betterAuth } from 'better-auth';
import { pool } from './db';
import { getValkey } from './cache';

const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

const secondaryStorage = {
  get: async (key: string) => {
    const v = await getValkey().get(key);
    return v ?? null;
  },
  set: async (key: string, value: string, ttl?: number) => {
    if (ttl) await getValkey().set(key, value, 'EX', ttl);
    else await getValkey().set(key, value);
  },
  delete: async (key: string) => {
    await getValkey().del(key);
  },
};

export const auth = betterAuth({
  database: pool,
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  secondaryStorage,
  trustedOrigins: (process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  emailAndPassword: { enabled: true, requireEmailVerification: false },
  socialProviders: googleEnabled
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
      }
    : {},
});
