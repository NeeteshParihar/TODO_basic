
import { Schema, model } from "mongoose";

interface IUser {
    username: string,
    email: string,
    password: string,
    profile: string,
    avatar: string,
    dob: Date;    
}

const userSchema = new Schema<IUser>({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        index: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        minLength: 8,
        required: true
    },
    avatar: {
        type: String,  
        default: null    
    },
    dob: {
        type: Date,
        default: null
    }

})

const User = model("User", userSchema);
export default User;