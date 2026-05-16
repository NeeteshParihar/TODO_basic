
import { Schema } from "mongoose";

type IdType = Schema.Types.ObjectId | string;

export interface IPayload {
    userId:IdType
};

export interface UserType {
    _id: string,
    username: string,
    email: string,
    avatar?: string | null,
    dob?: Date | null,
    password?: string,
    createdAt?: Date,
    updatedAt?: Date
    _v?: number
}
