import { createClient } from 'redis';

//dotenv.config();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redis = createClient({ url: redisUrl });

const cacheKey = 'demo:products';
const cacheTtlSeconds = 60;
let dbProducts = ['Keyboard', 'Mouse', 'Laptop'];

async function run(): Promise<void> {
  await redis.connect();
  
  // First request - cache miss
  let cached = await redis.get(cacheKey);

  if (cached) {
    console.log('Cache HIT');
    console.log('Data: ', JSON.parse(cached));
  } else {
    console.log('Cache MISS');
    // Read from main DB
    const products = dbProducts;
    // Save the data in Redis
    // setEx: also saves TTL so the data doesn't live forever
    await redis.setEx(cacheKey, cacheTtlSeconds, JSON.stringify(products));
  }

  // Stale cache problem
  dbProducts = ['Keyboard', 'Mouse', 'Laptop', 'Desktop'];
  console.log('New data: ', dbProducts);
  cached = await redis.get(cacheKey);
  console.log('Cached data: ', JSON.parse(cached!));

  // Cache invalidation
  // When the DB updates, delete the entry on cache
  await redis.del(cacheKey);
  console.log('Cache delete!');
  cached = await redis.get(cacheKey);

  if (!cached) {
    console.log('Cache data after delete');
    // Data from DB changes
    const newestProducts = dbProducts;
    await redis.setEx(cacheKey, cacheTtlSeconds, JSON.stringify(newestProducts));
    cached = await redis.get(cacheKey);
    console.log('Fresh data: ', cached);
  }

  await redis.quit();
}

run();