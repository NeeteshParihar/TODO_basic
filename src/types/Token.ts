import Types from "mongoose";

export interface IRefreshToken  { 
  userId: Types.ObjectId | string;
  refreshToken: string; 
  expiresAt?: Date;
}

