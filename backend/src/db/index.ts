import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

let isConnected = false;

export const connectDB = async () => {
    if (isConnected) return;
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`,
    );
    console.log(
      `\n MongoDB connected ✔ Host: ${connectionInstance.connection.host}`,
    );
     isConnected = connectionInstance.connection.readyState === 1;
  } catch (error) {
    console.log("MongoDB FAILED ❌", error);
    process.exit(1);
  }
};
