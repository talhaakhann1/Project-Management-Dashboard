import mongoose, { Document, Schema, Model } from "mongoose";
import type { IUser } from "../interfaces/user.interface.ts";
import crypto from "crypto";
import {
  AvailableSocialLogins,
  AvailableUserRoles,
  UserLoginType,
  UserRolesEnum,
} from "../constant.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { NextFunction } from "express";

const userSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },
    avatar: {
      type: {
        url: String,
        localPath: String,
      },
      default: {
        url: `https://via.placeholder.com/200x200.png`,
        localPath: "",
      },
    },
    password: {
      type: String,
      required: function () {
        return this.loginType === "EMAIL_PASSWORD";
      },
    },
    role: {
      type: String,
      enum: AvailableUserRoles,
      default: UserRolesEnum.USER,
      required: true,
    },
    refreshToken: {
      type: String,
    },
    isActive: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true },
);

userSchema.pre('save', async function (next:NextFunction) {
  if (!this.isModified("password")) return next;
  this.password = await bcrypt.hash(this.password, 10);
  next;
});

userSchema.methods.isPasswordValid=async function(password:string){
  return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      password: this.password,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET!,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY!,
    },
  );
};

userSchema.methods.generaterefreshToken = function () {
  return jwt.sign(
    {

      _id: this._id,
      email: this.email,
      password: this.password,
      fullName: this.fullName,
    },
    process.env.REFRESH_TOKEN_SECRET!,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY!,
    },
  );
};

userSchema.methods.generateTemporaryToken= function(){
  const unHashedToken= crypto.randomBytes(32).toString("hex");
   const hashedToken = crypto
        .createHash("sha256")
        .update(unHashedToken)
        .digest("hex");
    const tokenExpiry = Date.now() + 15 * 60 * 1000;
    return { unHashedToken, hashedToken, tokenExpiry }
}

export const User: Model<IUser> = mongoose.model<IUser>(
  "User",
  userSchema,
);
