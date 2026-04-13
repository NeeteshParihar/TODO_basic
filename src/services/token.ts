import RefreshToken from "../models/refreshtokens.js";
import {   IRefreshToken } from "../types/Token.js";
import { getRefreshTokenHash } from "../utils/bcyrpt.js";

const getMaxAge = () => {
  const maxAgeInDays: number = 1;
  return new Date(Date.now() + maxAgeInDays * 24 * 60 * 60 * 1000);
};

/* 
interface IRefreshToken  { 
  refreshToken: string; 
  expiresAt: Date;
}
*/

export const createRefreshToken = async ({
  userId,
  refreshToken,
}: IRefreshToken) => {
  // hashtemp

  const hashCode = getRefreshTokenHash(refreshToken);

  await RefreshToken.create({
    user: userId,
    refreshToken: hashCode,
    expiresAt: getMaxAge(),
  });

};

export const deleteRefreshToken = async (refreshToken: string) => {
  const hashCode =  getRefreshTokenHash(refreshToken);
   await RefreshToken.deleteOne({ refreshToken: hashCode });

};

export const getRefreshToken = async (refreshToken: string): Promise<IRefreshToken | null > => {
   const hashCode =  getRefreshTokenHash(refreshToken);
  return await RefreshToken.findOne({ refreshToken:hashCode });
};

export const revokeAllRefreshTokens = async ( userId: string) => {
  await RefreshToken.deleteMany({ user: userId });
}

//  $2b$10$UjrEWcxh3XHIhPR3jfXqAuP3Cy/GEAJanO.yqT.l0KU/4n.vgOuze
// $2b$10$1MAohxkJwZVyfuSC8CfbzOuSOfTpd0YL58NJpB5ocTO7Z7vSkwBeG
