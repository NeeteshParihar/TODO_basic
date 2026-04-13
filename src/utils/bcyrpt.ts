import bcrypt from "bcrypt";
import crypto from "crypto";
import RefreshToken from "../models/refreshtokens.js";

const saltRounds = 10;

export const hashPassword = async (password: string): Promise<string> => {
  const hashedValue: string = await bcrypt.hash(password, saltRounds);
  return hashedValue;
};

export const comparePassword = async (
  password: string,
  hashPassword: string,
): Promise<boolean> => {
  const matched = await bcrypt.compare(password, hashPassword);
  return matched;
};



export const getRefreshTokenHash = (refreshToken: string) => {
  const secret = process.env.HASH_KEY; // Keep this safe!
  return crypto.createHmac("sha256", secret as any).update(refreshToken).digest("hex");
};


