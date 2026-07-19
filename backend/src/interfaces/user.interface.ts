import type { Document } from "mongoose";

export interface IUser extends Document {
  fullName: string;
  email: string;
  password:string;
  avatar: { url: string; localPath: string };
  refreshToken:string;
  accessToken:string;
  role:string;
  generateAccessToken(rememberMe:boolean):string;
  generateRefreshToken(rememberMe:boolean):string;
  generateTemporaryToken():{};
  isPasswordValid(password:string):Promise<boolean>
}
