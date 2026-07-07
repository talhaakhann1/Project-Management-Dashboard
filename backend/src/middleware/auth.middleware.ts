import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import type { NextFunction, Request } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import type { TokenPayload } from "../types/global.js";
import type { IUser } from "../interfaces/user.interface.js";

export const verifyJwt = asyncHandler(async (req: Request,_, next:NextFunction) => {
  try {
    const token =
      req.cookies.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    const decodedToken = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!,
    ) as TokenPayload;

     if (!decodedToken) {
            throw new ApiError(401, "Unauthorized request")
        }
    const user = await User.findById(decodedToken._id).select("-password -refreshToken");
    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }
    req.user = user as IUser;
    next();
  } catch (error:unknown) {
    throw new ApiError(401, "Invalid access token")
  }
});
