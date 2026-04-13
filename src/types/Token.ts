import Types from "mongoose";

export interface IRefreshToken  { 
  user:Types.ObjectId | string,
  refreshToken: string; 
  expiresAt: Date;
}

