import RefreshToken from "../models/refreshtokens.js";
import { IRefreshToken } from "../types/Token.js";
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
  expiresAt,
}: IRefreshToken) => {
  // hashtemp

  const hashCode = await getRefreshTokenHash(refreshToken);

  await RefreshToken.create({
    user: userId,
    refreshToken: hashCode,
    expiresAt: getMaxAge(),
  });
};

export const deleteRefreshToken = async ( refreshToken: string) => {
  await RefreshToken.deleteOne({ refreshToken });
}

export const getRefreshToken = async (refreshToken: string  ) => {
  await RefreshToken.findOne({ refreshToken });
}
