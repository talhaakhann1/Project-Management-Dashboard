import mongoose, { Document, Schema, Model } from "mongoose";
import type { IUser } from "../interfaces/user.interface.ts";
import crypto from "crypto";
import {
  AvailableUserRoles,
  UserRolesEnum,
} from "../constant.js";
import bcrypt from "bcrypt";
import jwt, { type SignOptions } from "jsonwebtoken";


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
      type: String
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
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordValid=async function(password:string){
  return await bcrypt.compare(password,this.password)
}


userSchema.methods.generateAccessToken = function (rememberMe:boolean = false) {
  const expiresIn = (rememberMe
    ? process.env.ACCESS_TOKEN_EXPIRY_LONG || "7d"
    : process.env.ACCESS_TOKEN_EXPIRY || "1d") as NonNullable<SignOptions["expiresIn"]>;
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET as string ,
    {
      expiresIn
    },
  );
};

userSchema.methods.generateRefreshToken = function (rememberMe:boolean = false) {
  const expiresIn = (rememberMe
    ? process.env.REFRESH_TOKEN_EXPIRY_LONG || "30d"
    : process.env.REFRESH_TOKEN_EXPIRY || "1d") as NonNullable<SignOptions["expiresIn"]>;
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      fullName: this.fullName,
    },
    process.env.REFRESH_TOKEN_SECRET as string,
    {expiresIn},
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
