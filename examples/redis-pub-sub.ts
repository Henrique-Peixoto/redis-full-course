// Publish/subscribe
// Publisher sends a message
// Subscriber listens and receives the message
// "Channel" is the topic name both sides use

import dotenv from 'dotenv';
import { createClient } from 'redis';

dotenv.config();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';