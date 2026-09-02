export interface User {
  id: string;
  fullName: string;
  email: string;
  password: string;
  avatar: { url: string; localPath: string };
  refreshToken: string;
  accessToken: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}


import {z} from 'zod'

export const changeAvatarSchema=z.object({
    avatar:z.file()
})