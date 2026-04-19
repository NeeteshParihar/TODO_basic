import { Request, Response, NextFunction } from "express";
import { getRateLimitStatus, isUserAllowed } from "../services/redis.js";


export const rateLimiter = (endpoint: string) => {

    return async (req: Request, res: Response, next: NextFunction) => {

        const userId = req.user?.userId || req.ip;  // in case of global rate limiting, we use ip as user may be undefined
        ``
        try {

            const isAllowed = await isUserAllowed(userId as string, endpoint);
            if (!isAllowed) {
                return res.status(429).json({
                    success: false,
                    message: "Too many requests, Please try again later!",
                });
            }

            const { remainingReqLeft, ttlLeft } = await getRateLimitStatus(userId as string, endpoint);

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