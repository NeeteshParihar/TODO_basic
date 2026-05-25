import { Request, Response, NextFunction } from "express";
import { getRateLimiterHelpers, type IRateLimiterHelpers} from "../services/redis.js";


export const rateLimiter = (endpoint: string, rateLimit = 200, ttl = 60) => {

    return async (req: Request, res: Response, next: NextFunction) => {

        const userId = ( req.user?.userId || req.ip ) as string;  // in case of global rate limiting, we use ip as user may be undefined
    
        try {

            const {isUserAllowed, getRateLimitStatus} = getRateLimiterHelpers(userId, endpoint, rateLimit, ttl);

            const isAllowed = await isUserAllowed();
            if (!isAllowed) {
                return res.status(429).json({
                    success: false,
                    message: "Too many requests, Please try again later!",
                });
            }
            const { remainingReqLeft, ttlLeft } = await getRateLimitStatus();

            res.setHeader("X-RATE-LIMIT-REMAINING", remainingReqLeft.toString());
            res.setHeader("X-RATE-LIMIT-RESET", ttlLeft.toString());

            next();

        } catch (err) {
            return res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }

    }

}