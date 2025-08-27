import express from "express";
import connectDB from "./config/connect.js";
import dotenv from "./config/dotenv.js";
import cookieParser from "cookie-parser";
import notFound from "./middlewares/notfound.js";
import errorMiddleware from "./middlewares/error-handler.js";
import userRouter from "./routes/user-route.js";
import postRouter from "./routes/post-route.js";
import commentRouter from "./routes/comment-route.js";
import reportRouter from "./routes/report-route.js";

const app = express();
const port = process.env.PORT || 5000;

//Middlewares
app.use(express.json());
app.use(cookieParser());

//routes
app.use("/api/v1/user", userRouter)
app.use("/api/v1/post", postRouter)
app.use("/api/v1/comment", commentRouter)
app.use("/api/v1/report", reportRouter)
//error
app.use(errorMiddleware);
app.use(notFound);

const start = async () => {
  try {
    await connectDB();

    app.listen(port, () => {
      console.log(`App is running on port: ${port}`);
    });
  } catch (error) {
    console.log(`Error: ${error}`);
  }
};

start();
