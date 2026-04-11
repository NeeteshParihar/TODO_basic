
import type { Request, Response, NextFunction } from "express";
import {decode, clearJwt} from "../utils/Jwt.js"
import type { JwtPayload } from "jsonwebtoken";
import { type } from "os";
import { IPayload } from "../types/user.js";


export const validateJwt = async ( req: Request, res: Response, next: NextFunction ) => {
    try{

        const cookies = req.cookies;
        const jwtToken = cookies.jwtToken;
        const payload: JwtPayload | null | string = decode(jwtToken);

        if(!payload) return res.status(400).json({ success: false, message: "Please login!"});

        const user = payload;
        req.user = user as IPayload;
        next();

    }catch(err){

        res.status(500).json({
            success: false, message: "Internal server error!"
        })
        
    }
}




