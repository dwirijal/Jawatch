import Redis from 'ioredis';

const url = process.env.VALKEY_URL ?? 'redis://valkey:6379';

let client: Redis | null = null;

export function getValkey(): Redis {
  if (!client) {
    client = new Redis(url, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      enableOfflineQueue: true,
      retryStrategy: (times) => (times > 10 ? null : Math.min(times * 200, 3000)),
    });
    client.on('error', (e) => {
      if (process.env.NODE_ENV !== 'production') console.warn('[valkey]', e.message);
    });
  }
  return client;
}

export const valkeyEnabled = () => client !== null;
