import { createClient, type RedisClientType } from "redis";

const client: RedisClientType = createClient({
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_URL,
    port: parseInt(process.env.REDIS_PORT as string),
  },
});



const connectRedis = async () : Promise<void> => {
    client.on( "error", (err)=> console.log("redish client error", err));
    await client.connect(); 
};


export default connectRedis;




