import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
export const redisClient = createClient({ url: redisUrl });

redisClient.on('connect', () => {
  console.log('Redis client connected!');
});

redisClient.on('ready', () => {
  console.log('Redis client ready!');
});

redisClient.on('error', (error) => {
  console.error('Redis error: ', error);
});

redisClient.on('end', () => {
  console.log('Redis client connection closed!');
});

export async function connectRedis(): Promise<void> {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }

  const pong = await redisClient.ping();
  console.log('Redis ping response: ', pong);
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient.isOpen) {
    await redisClient.quit();
  }
}