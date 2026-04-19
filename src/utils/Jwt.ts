import jwt from "jsonwebtoken";
import { Response } from "express";

interface IPayload {
  userId: string;
  iat: number;
  exp: number;
}

const SECRET = process.env.SECRET_KEY as string;
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET as string; 
const time = (process.env.JWT_EXPIRY || "15m") as any;

export const generateJwt = (payload: IPayload): string => {
  console.log(time);
  console.log(typeof time);
  // We add an expiration (e.g., 2 hours) to ensure the token isn't valid forever
  const token = jwt.sign(payload, SECRET, {
    expiresIn: time,
  });
  return token;
};

export const decode = (token: string): IPayload | null => {
  try {
    // verify() checks the Signature AND the 'exp' claim automatically
    const payload = jwt.verify(token, SECRET);
    return payload as  IPayload ;
  } catch (error) {
    return null;
  }
};

export const clearJwt = (res: Response) => {
  res.clearCookie("jwtToken");
};

export const setCookie = (token: string, res: Response) => {
  res.cookie("jwtToken", token, {
    httpOnly: true, // Prevents JavaScript access (XSS protection)
    secure: process.env.NODE_ENV === "production", // Only sends over HTTPS in production
    sameSite: "strict", // Prevents CSRF attacks
    maxAge: 15 * 60 * 1000, // Match the JWT expiration ( 15 minutes in milliseconds)
  });
};

export const generateRefToken = (Payload: { userId: string }): string => {
  const refToken = jwt.sign(Payload, REFRESH_SECRET, {
    expiresIn: "1d",
  });
  return refToken;
};

export const decodeRefToken = (token: string): IPayload | null => {
  try {
    const payload = jwt.verify(token, REFRESH_SECRET);
    return payload as  IPayload ;
  } catch (error) {
    return null;
  }
};

export const setRefToken = (refToken: string, res: Response) => {
  res.cookie("refToken", refToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000,
    path: "/api/user/auth",
  });
};

export const clearRefToken = (res: Response) => {
  res.clearCookie("refToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000,
    path: "/api/user/auth",
  });
};
