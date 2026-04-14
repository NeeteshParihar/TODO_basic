import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import { createClient } from "redis";

const client = createClient({
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_URL,
        port: parseInt(process.env.REDIS_PORT),
    },
});

const connectRedis = async () => {
    client.on("error", (err) => console.log("redish client error", err));
    try {
        await client.connect();
        console.log("connected to redish");
    } catch (err) {
        console.log("error connecting to redish", err);
    }
};


await connectRedis();

// const res = await client.set("drink", "water");
// console.log(res);

// const res = await client.get("drink");

// console.log("mydrink", res);

// const res = await client.del("drink");
// console.log(res);

// const res = await client.set("drink", "coffee", {
//     EX: 10  // time in seconds 
// });

// console.log(res);

// const val = await client.incrBy("view", 10);
// console.log(val);
// process.exit(0);

const getResponse = async (username) => {

    const count = await client.get(username);

    if (count === null) {
        await client.set(username, 1, { EX: 60 });
    } else {

        if (count == 10) {
            throw new Error("rate limit reached");
        }
        await client.incr(username);
        console.log("response fullfilled");
    }

}


for (let i = 10; i < 100; i++) {

    try {
        await getResponse("neetesh");

    } catch (err) {
        console.log(err.message);
    }
}


process.exit(0);




