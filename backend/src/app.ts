import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.js";
import projectRouter from "./routes/project.routes.js";
import taskRouter from "./routes/task.routes.js";
import chatRouter from "./routes/chat.routes.js";
import messageRouter from "./routes/message.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import { ApiError } from "./utils/ApiError.js";
import { Server } from "socket.io";
import { rateLimit, ipKeyGenerator } from "express-rate-limit";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import { initializeSocketIO } from "./socket/index.js";
import requestIp from "request-ip";
import { createClient } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";
import { errorHandler } from "./middleware/error.middleware.js";

export const app = express();

export const server = http.createServer(app);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:5173",
      "http://localhost:8000",
      "http://localhost:8080",
    ],
    credentials: true,
    methods: ["GET", "POST"],
  },
  // ✅ Add these options
  allowEIO3: true,
  transports: ["polling", "websocket"],
});

const pubClient = createClient({
  url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
  RESP: 2,
});

const subClient = pubClient.duplicate();

pubClient.on("error", (err) => {
  console.error("Redis Publisher Error:", err);
});

subClient.on("error", (err) => {
  console.error("Redis Subscriber Error:", err);
});


await Promise.all([
  pubClient.connect(),
  subClient.connect(),
]);

io.adapter(createAdapter(pubClient, subClient));

const allowedOrigins = [
  "http://localhost:3000",
  process.env.CORS_ORIGIN,
].filter((origin): origin is string => Boolean(origin));

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.use(express.static("/public"));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.json({ limit: "16kb" }));
app.use(cookieParser());

app.set("io", io);

initializeSocketIO(io);

app.use("/", userRouter);
app.use(requestIp.mw());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5000,
  standardHeaders: true,
  legacyHeaders: false,

  keyGenerator: (req) => {
    return ipKeyGenerator(req.ip || "127.0.0.1");
  },

  handler: (_, __, ___, options) => {
    throw new ApiError(
      options.statusCode || 429,
      `There are too many requests. You are only allowed ${
        options.limit
      } requests per ${options.windowMs / 60000} minutes`,
    );
  },
});

app.use(limiter);

app.use("/health-check", (req, res) => {
  res.json({ status: "OK" });
});

app.use("/api/projects", projectRouter);
app.use("/api/tasks", taskRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/chat-app/chats", chatRouter);
app.use("/api/chat-app/messages", messageRouter);

app.use(errorHandler);

export default app;
