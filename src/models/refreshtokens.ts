import  { Schema, model, Types } from "mongoose";
import { IRefreshToken } from "../types/Token.js";

const RefreshTokenSchema = new Schema<IRefreshToken>({ 
  user: {
    type:  Schema.Types.ObjectId,
    ref: "User",
    unique: true,
    index: true        
  },
  refreshToken: { type: String, required: true, unique: true, index: true },  
  expiresAt: { type: Date, required: true }
});


const RefreshToken = model("refreshToken", RefreshTokenSchema);
export default RefreshToken;


