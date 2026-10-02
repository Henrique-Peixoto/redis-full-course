import dotenv from 'dotenv';
import { createClient } from 'redis';

dotenv.config();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redis = createClient({ url: redisUrl });

async function run() {
  // Open connection to redis server
  await redis.connect();
  console.log("Connected to Redis.");
  console.log("Ping", await redis.ping());

  // String -------------
  //  Stores one value under one key
  //  Plain text, numbers stored as text, counter
  //  key: page_views
  //  value: "100"
  const stringKey = "demo:page_view";
  await redis.set(stringKey, "100");
  const pageViews = await redis.get(stringKey);
  console.log("Redis page views: ", pageViews);

  // Redis strings can also be used as counters
  const afterInc = await redis.incr(stringKey);
  console.log("Redis page views after inc: ", afterInc);

  // Hash -------------
  //  Stores many small fields under one key - small object or map
  //  key: keyname
  //  fields:
  //    name -> "henrique"
  //    email -> "henrique@email"
  const hashKey = "demo:user:profile";
  
  await redis.hSet(hashKey, {
    name: "henrique",
    country: "Brazil" 
  });

  const extractedProfileInfo = await redis.hGetAll(hashKey);
  console.log("Profile info: ", extractedProfileInfo);

  // List -------------
  //  Ordered collection of values
  const listKey = "demo:messages";
  await redis.lPush(listKey, "Item 1"); // lPush - Left push; rPush - Right push
  await redis.lPush(listKey, "Item 2");

  const extractedMessages = await redis.lRange(listKey, 0, -1); // lRange - reads items from the list
  // lTrim - slices the list (key, start, stop)
  console.log("List of messages: ", extractedMessages);

  // Set -------------
  //  Sets with unique values
  const setKey = "demo:tags";
  await redis.sAdd(setKey, "nodejs");
  await redis.sAdd(setKey, "nextjs");
  await redis.sAdd(setKey, "nextjs");
  
  const tagCount = await redis.sCard(setKey);
  console.log("Set element count: ", tagCount);

  // Rank -------------
  const rankKey = "demo:leaderboard";
  await redis.zAdd(rankKey, { score: 100, value: "player_a"});
  await redis.zAdd(rankKey, { score: 200, value: "player_b"});
  const newScore = await redis.zIncrBy(rankKey, 50, "player_b");
  console.log("New score: ", newScore);

  // 0 = top rank
  const rank = await redis.zRevRank(rankKey, "player_b");
  console.log("Rank: ", rank);

  // TTL / Expiry -------------
  //  Time to live
  //  It tells Redis how long a key should be kept being automatic deleted

  // key: a
  // value: "345"
  // ttl: 300 second
  // After 5 minutes, Redis is going to delete this key automatically
  const otpKey = "demo:otp";
  await redis.set(otpKey, "123456");
  await redis.expire(otpKey, 60);
  const ttl = await redis.ttl(otpKey);
  console.log("TTL: ", ttl);

  await redis.quit();
}

run().catch((error) => {
  console.error("Demo failed: ", error);
  process.exit(1);
});
