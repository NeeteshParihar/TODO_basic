import User from "../models/User.js";
import Todo from "../models/Todo.js";
import { hashPassword } from "../utils/bcyrpt.js";
import {Schema} from "mongoose";

type IdType = Schema.Types.ObjectId;


export const checkUserInDb = async (email: string) => {
    const isExists  = await User.exists({ email});
    return isExists; 
};

export const createUser = async ( username: string, email: string, password: string) => {

    const hashCode = await hashPassword(password);

    const newUser = await User.create({
        username,
        email,
        password: hashCode
    });
    return newUser;
    
}

export const getUser = async ( identifier: string, fields: string[] = ['username', 'email']) => {

    const prop = fields.join(' ');
    const isEmail = identifier.includes('@');    
    const user = isEmail ? await User.findOne({ email: identifier }).select(prop) : await User.findOne({ _id: identifier}).select(prop);
    return user;
}

export const deleteUserFromDB = async( userId: string) => {
    // delete the todos of the user
    await Todo.deleteMany({ user: userId });
    const user = await User.findByIdAndDelete(userId);
    return user;
}


