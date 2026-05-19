import User from "../models/User.js";
import Todo from "../models/Todo.js";
import { hashPassword } from "../utils/bcyrpt.js";
import {Schema} from "mongoose";

type IdType = Schema.Types.ObjectId;

import type { UserType } from "../types/user.js";

export const checkUserInDb = async (email: string) => {
    const isExists  = await User.exists({ email});
    return isExists; 
};


interface IUser {
    _id: string
    username: string
    email: string
    password: string
}

export const createUser = async ( {_id, username, email, password}:IUser ): Promise<UserType> => {

    const hashCode = await hashPassword(password);

    const newUser = await User.create({
        _id,
        username,
        email,
        password: hashCode
    });

    // Use destructuring to safely omit the password property instead of 'delete'
    const { password: _, ...userData } = newUser.toObject();    
    return {
        ...userData,
        _id: String(userData._id),
    };
    
}

export const getUser = async ( identifier: string, fields: string[] = ['username', 'email']) => {

    const prop = fields.join(' ');
    const isEmail = identifier.includes('@');    
    const user = isEmail ? await User.findOne({ email: identifier }).select(prop) : await User.findOne({ _id: identifier}).select(prop);
     return !user? null: {
        ...user.toObject(),
        _id: String(user._id)
     }
}

export const deleteUserFromDB = async( userId: string) => {
    // delete the todos of the user
    await Todo.deleteMany({ user: userId });
    const user = await User.findByIdAndDelete(userId);
    return user;
}



export const updateUserInDB = async (userId: string, username?: string, dob?: string) => {
    const updateQuery: Record<string, any> = {};
    
    if (username !== undefined && username !== null) {
        updateQuery.username = username;
    }
    if (dob !== undefined && dob !== null) {
        updateQuery.dob = dob;
    }

    if (Object.keys(updateQuery).length === 0) return null;

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updateQuery },
        { returnDocument: "after", runValidators: true }
    ).select('-password');

    return updatedUser ? {
        ...updatedUser.toObject(),
        _id: String(updatedUser._id)
    } : null;
}