import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../redis/client';

const RATE_LIMIT_WINDOW_SECONDS = 60;
const RATE_LIMIT_MAX_REQUESTS = 5;

export async function productRateLimiter(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Each IP will get its own counter in Redis
    // rate_limit:products:127.0.5.5
    
    // Note: this strategy is not going to block every user going above this limit
    // For doing so, a proxy or load balancer would be a better tool

    const ip = req.ip || 'unknown';
    const rateLimiterKey = `rate_limit:products:${ip}`;
    const requestCount = await redisClient.incr(rateLimiterKey);

    if (requestCount === 1) {
      // Starting the rate limit after the first request
      // After RATE_LIMIT_WINDOW_SECONDS seconds, this key will be deleted
      //  and the counter will restart
      await redisClient.expire(rateLimiterKey, RATE_LIMIT_WINDOW_SECONDS);
    }

    res.setHeader('X-RateLimit-Limit', RATE_LIMIT_MAX_REQUESTS);
    const remainingRequests = Math.max(0, RATE_LIMIT_MAX_REQUESTS - requestCount);
    res.setHeader('X-RateLimit-Remaining', remainingRequests);

    if (requestCount > RATE_LIMIT_MAX_REQUESTS) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests! Try again later.'
      });
    }

    next();
  } catch (error) {
    console.error('Rate limit Redis error: ', error);
    next(error);
  }
}