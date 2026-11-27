import { server } from "./app.js";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import { connectDB } from "./db/index.js";
import { connectRedis } from "./config/redis.js";

dotenv.config({
  path: "./.env",
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});


const PORT = process.env.PORT || 8000;

connectDB();
connectRedis()
  .then(() => {
     server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

    server.on("error", (err) => {
      console.error("Server error:", err);
    });
  })
  .catch((err: unknown) => {
    console.error("MongoDB connection failed:", err);
  });
