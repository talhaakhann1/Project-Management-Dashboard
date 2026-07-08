import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import type { Request, Response } from "express";
import { UserRolesEnum } from "../constant.js";
import { uploadAtCloudinary } from "../utils/cloudinary.js";
import { getLocalPath, removeLocalFile } from "../utils/helper.js";
import type { IUser } from "../interfaces/user.interface.js";
import type { Types } from "mongoose";

const generateAccessAndRefreshToken = async (userId: Types.ObjectId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken!;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token",
    );
  }
};

export const registerUser = asyncHandler(
  async (req: Request, res: Response) => {
    const { fullName, email, password } = req.body;
    const existedUser = await User.findOne({
      $or: [{ fullName }, { email }],
    });
    if (existedUser) {
      throw new ApiError(
        409,
        "User with same email or username already exists",
      );
    }

    const user = await User.create({
      fullName: fullName.toLowerCase(),
      email,
      password,
      role: UserRolesEnum.USER,
      isActive: false,
    });
    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken",
    );
    if (!createdUser) {
      throw new ApiError(
        500,
        "Something went wrong while registering the user",
      );
    }
    return res
      .status(200)
      .json(
        new ApiResponse<IUser>(
          201,
          createdUser,
          "User registered successfully",
        ),
      );
  },
);

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({
    email,
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const userId = user._id;

  const isPasswordValid = await user.isPasswordValid(password);

  if (!isPasswordValid) {
    throw new ApiError(404, "Invalid user credentials");
  }

  const { accessToken, refreshToken } =
    await generateAccessAndRefreshToken(userId);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, loggedInUser, "Successfully loggedIn user"));
});

export const logOutUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user._id;

  const user = await User.findByIdAndUpdate(userId, {
    $unset: {
      refreshToken: 1,
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const option = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", option)
    .clearCookie("refreshToken", option)
    .json(new ApiResponse(200, {}, "User logout"));
});

export const changeUserAvatar = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.file) {
      throw new ApiError(400, "Avatar file is missing");
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      throw new ApiError(404, "User not found");
    }
    const avatarLocalPath = getLocalPath(req.file.filename);

    const avatar = await uploadAtCloudinary(avatarLocalPath);

    if (!avatar) {
      throw new ApiError(400, "Error during uploading avatar on cloudinary");
    }
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          avatar: {
            url: avatar.url,
            localPath: avatarLocalPath,
          },
        },
      },
      {
        new: true,
      },
    ).select("-password -refreshToken");

    if (!updatedUser) {
      throw new ApiError(400, "Faild to update the user avatar");
    }

    removeLocalFile(updatedUser.avatar.localPath);

    return res
      .status(200)
      .json(new ApiResponse(200, updatedUser, "Avatar updated successfully"));
  },
);

export const getCurrentUser = asyncHandler(
  async (req: Request, res: Response) => {
    return res
      .status(200)
      .json(new ApiResponse(200, req.user, "Current user fetch successfully"));
  },
);

export const getAvailableUsers = asyncHandler(
  async (req: Request, res: Response) => {
    const users = await User.aggregate([
      {
        $match: {},
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $project: {
          _id: 1,
          fullName: 1,
        },
      },
    ]);

    return res
      .status(200)
      .json(
        new ApiResponse(200, users || [], "Successfuly fetch available user"),
      );
  },
);
