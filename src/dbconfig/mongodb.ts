
import mongoose from 'mongoose';
import dns from "dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);


console.log(process.env.MONGO_URL);

export const connectDB = async ()=>{
   await mongoose.connect(process.env.MONGO_URL as string);
}


