
import bcrypt from 'bcrypt';
import crypto from "crypto";
import RefreshToken from '../models/refreshtokens.js';

const saltRounds = 10;

export const hashPassword = async( password: string): Promise<string> =>{
    const hashedValue: string = await bcrypt.hash(password, saltRounds);
    return hashedValue;
}


export const comparePassword = async( password: string, hashPassword: string): Promise<boolean> =>{ 
    const matched = await bcrypt.compare(password, hashPassword);
    return matched;
}





export const getRefreshTokenHash = async (refreshToken: string) => {
    // 1. Create SHA-256 hash. 
    // "hex" results in a 64-character string (0-9, a-f).
    // "base64" results in a 44-character string.
    const digest = crypto.createHash("sha256").update(refreshToken).digest("hex");

    // 2. Bcrypt the digest.
    // Since 64 < 72, bcrypt will process the entire string.
    const finalHash = await bcrypt.hash(digest, 10);
    return finalHash;

};


