import mongoose, { Schema, type Document, Types } from "mongoose";
import type { IChat } from "../interfaces/chat.interface.js";

const chatSchema = new Schema<IChat>(
  {
    name: {
      type: String,
      required: true,
    },
    isGroupChat: {
      type: Boolean,
      default: false,
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    admin: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

export const Chat = mongoose.model<IChat>("Chat", chatSchema);