
import mongoose from 'mongoose';
import dns from "dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import dotenv from "dotenv";
dotenv.config({ path: "./.env" });


export const connectDB = async ()=>{
   await mongoose.connect(process.env.MONGO_URL );
}


connectDB().then(()=>{
    console.log("connected to db");
}).catch((err)=>{
    console.log("error connecting to db", err);
});



