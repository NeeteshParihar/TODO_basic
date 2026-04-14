import "./utils/loadEnv.js";
import express from "express";
import connectRedis from "./dbconfig/redis.js";
import { connectDB } from "./dbconfig/mongodb.js";

import userRouter from "./routes/user.js";
import todoRouter from "./routes/todo.js";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";

const port: number = Number(process.env["PORT"]) || 3000;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); //parser cookie from header to js object and adds to the request

// // setup the middleware for using the route
app.use("/api/user", userRouter);
app.use("/api/todo", todoRouter);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

const Init = async () => {
  try {

    await Promise.all([
      connectDB()
        .then(() => console.log("connected to mongodb"))
        .catch((err) => {
          console.log("Mongodb connection failed", err);
          throw err;
        }),
      connectRedis()
        .then(() => console.log("connected to Redish"))
        .catch((err) => {
          console.log("redish connection failed", err);
          throw err;
        }),
    ]);

    app.listen(port, () => {
      console.log(`server is listening at port ${port}`);
    });
  } catch (err) {
    process.exit(1);
  }
};

// run the server
Init();
