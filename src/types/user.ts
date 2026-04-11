
import { Schema } from "mongoose";

type IdType = Schema.Types.ObjectId | string;

export interface IPayload {
    userId:IdType
};