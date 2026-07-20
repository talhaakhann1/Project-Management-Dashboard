import express from "express"
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import { errorHandler } from "./middleware/error.middleware.js";
import cors from "cors"
import cookieParser from "cookie-parser"
import userRouter from "./routes/user.routes.js";
import projectRouter from "./routes/project.routes.js";
import taskRouter from "./routes/task.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";

const app=express();

dotenv.config({
   path:"./.env"
})

const allowedOrigins = [
  "http://localhost:3000",
  process.env.CORS_ORIGIN,
].filter((origin): origin is string => Boolean(origin));

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!
})


app.use(express.static("/public"));
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.json({limit:"16kb"}))
app.use(cookieParser())


app.use('/',userRouter)

app.use('/api/projects',projectRouter)
app.use('/api/tasks',taskRouter)
app.use('/api/dashboard',dashboardRouter)

app.use(errorHandler)


export default app