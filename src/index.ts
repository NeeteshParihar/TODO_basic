import "./utils/loadEnv.js";
import express from "express";
import { connectDB } from "./dbconfig/mongodb.js";

import userRouter from "./routes/user.js";
import todoRouter from "./routes/todo.js";
import cookieParser from "cookie-parser";

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
    await connectDB();

    console.log("connected to database");
    app.listen(port, () => {
      console.log(`server is listening at port ${port}`);
    });
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

// run the server 
Init();
