import { Schema, model, type Document } from "mongoose";

export interface IRefreshToken extends Document {
  token: string;
  user: Schema.Types.ObjectId;
  expiryDate: Date;
}

const RefreshTokenSchema = new Schema<IRefreshToken>({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  expiryDate: { type: Date, required: true },
});

export default model<IRefreshToken>("RefreshToken", RefreshTokenSchema);/*  */