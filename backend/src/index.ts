import app from "./app.js";
import dotenv from "dotenv";
import { connectDB } from "./db/index.js"
import { connectRedis } from "./config/redis.js";

dotenv.config({
  path: "./.env",
});

const PORT = process.env.PORT || 8000;

connectDB()
connectRedis()
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

    server.on("error", (err) => {
      console.error("Server error:", err);
    });
  })
  .catch((err: unknown) => {
    console.error("MongoDB connection failed:", err);
  });
