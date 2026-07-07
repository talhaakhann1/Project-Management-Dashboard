import { ApiError } from "../utils/ApiError.js";
import mongoose from "mongoose";
import type {
  Request,
  Response,
  NextFunction,
} from "express";

export const errorHandler = (
    err:any,
     req:Request,
      res:Response,
       next:NextFunction):Response => {
    let error = err;

    // Check if the error is an instance of an ApiError class which extends native Error class
    if (!(error instanceof ApiError)) {

        const statusCode =
            error.statusCode || (error instanceof mongoose.Error ? 400 : 500);

        const message = error?.message || "Something went wrong";
        error = new ApiError(statusCode, message, error?.errors || [], err?.stack);
    }

    const response = {
        ...error,
        message: error.message,
        ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {}), // Error stack traces should be visible in development for debugging
    };

    console.error(`${error.message}`);


    return res.status(error.statusCode).json(response);
};

