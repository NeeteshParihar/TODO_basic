
import type { Request, Response, NextFunction } from "express";
import {decode, clearJwt} from "../utils/Jwt.js"
import type { JwtPayload } from "jsonwebtoken";
import { type } from "os";
import { IPayload } from "../types/user.js";

import { isJWTBlocked } from "../services/redis.js";

import { RESCODE } from "../utils/constants.js";


export const validateJwt = async ( req: Request, res: Response, next: NextFunction ) => {
    try{

        const cookies = req.cookies;
        const jwtToken = cookies.jwtToken;
        const payload: JwtPayload | null | string = decode(jwtToken);

        if(!payload) return res.status(401).json({ success: false, message: "Please login!", accessTokenExpired: RESCODE.accessTokenExpired});

        const isBlocked = await isJWTBlocked(jwtToken);
        if(isBlocked) return res.status(401).json({ success: false, message: "Please login again!", accessTokenExpired: RESCODE.accessTokenExpired});

        const user = payload;
        if(!user || user._id) throw new Error("Invalid user")
        req.user = user as IPayload;
        next();

    }catch(err){

        res.status(401).json({
            success: false, message: (err as Error).message, clientError: RESCODE.clientError
        })
        
    }
}




