import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

export const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(
            `\n MongoDB connected ✔ Host: ${connectionInstance.connection.host}`
        );
    } catch (error) {
        console.log("MongoDB FAILED ❌", error);
        process.exit(1);
    }
}

