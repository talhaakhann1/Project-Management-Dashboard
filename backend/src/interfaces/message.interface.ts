import type { Types } from "mongoose";

export interface IAttachment {
  url?: string | null;
  localPath?: string | null;
}

export interface IMessage extends Document {
  sender: Types.ObjectId;
  content?: string;
  attachments: IAttachment[];
  chat: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}