export type UserRole = "ADMIN" | "USER";
export type UserLoginType = "GOOGLE" | "GITHUB" | "EMAIL_PASSWORD";

export interface UserAvatar {
  url: string;
  localPath: string;
}

export interface User {
  _id?: string;
  id?: string;
  fullName: string;
  username?: string;
  email: string;
  avatar: UserAvatar;
  role?: UserRole | string;
  loginType?: UserLoginType;
  isEmailVerified?: boolean;
  isActive?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface ChatParticipant {
  _id: string;
  id?: string;
  fullName: string;
  username?: string;
  email: string;
  avatar: UserAvatar;
  role?: UserRole | string;
  loginType?: UserLoginType;
  isEmailVerified?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MessageSender {
  _id: string;
  fullName: string;
  username?: string;
  email: string;
  avatar: UserAvatar;
}

export interface MessageAttachment {
  url: string;
  localPath: string;
  _id?: string;
}

export interface Message {
  _id: string;
  sender: MessageSender;
  content?: string;
  attachments: MessageAttachment[];
  chat: string; // Chat ObjectId
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface RawDeletedMessage {
  _id: string;
  sender: string; // User ObjectId
  content?: string;
  attachments: MessageAttachment[];
  chat: string; // Chat ObjectId
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface Chat {
  _id: string;
  name: string;
  isGroupChat: boolean;
  admin: string; // User ObjectId
  participants: ChatParticipant[];
  lastMessage: Message | null;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedMessagesResponse {
  messages: Message[];
  currentPage: number;
  totalPages: number;
  totalMessages: number;
}

export interface AuthSuccessData {
  user: User;
  accessToken: string;
  refreshToken: string;
}
