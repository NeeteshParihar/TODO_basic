import  { Schema, model, Types } from "mongoose";

interface IRefreshToken  { 
  user:Types.ObjectId | string,
  refreshToken: string; 
  expiresAt: Date;
}



const RefreshTokenSchema = new Schema<IRefreshToken>({ 
  user: {
    type:  Schema.Types.ObjectId,
    ref: "User",
    index: true        
  },
  refreshToken: { type: String, required: true, unique: true, index: true },  
  expiresAt: { type: Date, required: true }
});


const RefreshToken = model("refreshToken", RefreshTokenSchema);
export default RefreshToken;


