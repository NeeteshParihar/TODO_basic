import  { Schema, model, Types } from "mongoose";

interface IRefreshToken  { 
  refreshToken: string;
  isRevoked: boolean;
  expiresAt: Date;
}


const RefreshTokenSchema = new Schema<IRefreshToken>({ 
  refreshToken: { type: String, required: true },
  isRevoked: { type: Boolean, default: false },
  expiresAt: { type: Date, required: true }
});


const RefreshToken = model("refreshToken", RefreshTokenSchema);

export default RefreshToken;


