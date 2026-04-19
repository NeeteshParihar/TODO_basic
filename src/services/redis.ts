import { client } from "../dbconfig/redis.js";
import jwt, { JwtPayload } from "jsonwebtoken";

export const maxRateLimit = 100;
const WINDOW_SIZE_IN_SECONDS = 60;

/**
 * Checks if the user is allowed to make a request based on rate limit.
 * Uses a fixed window size of 60 seconds.
 * 
 * @param userId The ID of the user.
 * @returns boolean True if allowed, false if rate limit exceeded.
 */
export const isUserAllowed = async (userId: string, endpoint: string): Promise<boolean> => {

  const key = `rate_limit:${userId}:${endpoint}`;

  // if the key exists it returns 1 else  0
  const exists = await client.exists(key);

  if (!exists) {

    const replies = await client.multi()
      .incr(key)
      .expire(key, WINDOW_SIZE_IN_SECONDS)
      .exec();

    const count = replies[0] as unknown as number;
    return count <= maxRateLimit;
  } else {
    // For subsequent requests, just increment the count
    const count = await client.incr(key);
    return count <= maxRateLimit;
  }
};

/**
 * Gets the remaining requests and time left in the current rate limit window.
 * 
 * @param userId The ID of the user.
 * @returns Object containing remainingReqLeft and ttlLeft
 */
export const getRateLimitStatus = async (userId: string, endpoint: string) => {

  const key = `rate_limit:${userId}:${endpoint}`;

  const replies = await client.multi()
    .get(key)
    .ttl(key)
    .exec();

  const countStr = replies[0] as unknown as string | null;
  const ttl = replies[1] as unknown as number;

  const count = countStr ? parseInt(countStr, 10) : 0;

  let remainingReqLeft = maxRateLimit - count;
  if (remainingReqLeft < 0) {
    remainingReqLeft = 0;
  }

  // ttl is -2 if key does not exist, -1 if key exists but has no associated expire // if it exists it gives us number of seconds left till it expires 
  let ttlLeft = ttl;
  if (ttlLeft < 0) {
    ttlLeft = 0;
  }

  return {
    remainingReqLeft,
    ttlLeft
  };

};

/**
 * Blocks a JWT by storing it in Redis until its expiration time.
 * 
 * @param token The JWT string to block.
 */
export const blockJWT = async (token: string) => { 

  const payload = jwt.verify(token, process.env.SECRET_KEY as string) as JwtPayload;
  // now the jwt is verified i.e its correct and not expired yet , so we have to store it in redis to prevent its further use 
  const key = `blockedJWT:${token}`;

  const ttl = payload.exp - Math.floor(Date.now() / 1000); 

  if( ttl <= 0) return;

  // Use a transaction to set the key and its expiration atomically
  await client.multi()
    .set(key, "1")
    .expire(key, ttl)
    .exec();


};

/**
 * Checks if a JWT token has been blocked.
 * 
 * @param token The JWT string to check.
 * @returns boolean True if blocked, false otherwise.
 */
export const isJWTBlocked = async (token: string): Promise<boolean> => {
  const key = `blockedJWT:${token}`;
  const exists = await client.exists(key);
  return exists === 1;
};
