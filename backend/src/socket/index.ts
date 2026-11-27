import { ApiError } from "../utils/ApiError.js";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { Chat } from "../models/chat.model.js";
import { ChatEventEnum } from "../types/enums/chat.enum.js";
import * as cookie from "cookie";
import type { Request } from "express";
import type { Server, Socket } from "socket.io";
import { Types } from "mongoose";

interface AuthenticatedSocket extends Socket {
  user?: {
    _id: Types.ObjectId;
  };
}

interface DecodedToken extends JwtPayload {
  _id: string;
}

const mountJoinChat = (socket: AuthenticatedSocket): void => {
  socket.on(ChatEventEnum.JOIN_CHAT_EVENT, async (chatId: string) => {
    try {
      if (!chatId || !Types.ObjectId.isValid(chatId)) {
        return;
      }

      const userId = socket.user?._id;
      if (!userId) {
        socket.emit(
          ChatEventEnum.SOCKET_ERROR_EVENT,
          "User not authenticated to join room",
        );
        return;
      }

      // Verify chat existence and user participation before joining room
      const chat = await Chat.findOne({
        _id: new Types.ObjectId(chatId),
        participants: userId,
      });

      if (!chat) {
        console.warn(
          `Unauthorized or invalid joinChat attempt by user ${userId} for chat ${chatId}`,
        );
        socket.emit(
          ChatEventEnum.SOCKET_ERROR_EVENT,
          "You are not authorized to join this chat room",
        );
        return;
      }

      console.log(`User ${userId} joined chat room 🤝: `, chatId);
      socket.join(chatId);
    } catch (err: unknown) {
      console.error("Error in joinChat handler:", err);
    }
  });

  socket.on(ChatEventEnum.LEAVE_CHAT_EVENT, (chatId: string) => {
    if (chatId) {
      console.log(`User left chat room 🚪: `, chatId);
      socket.leave(chatId);
    }
  });
};

const mountParticipantTypingEvent = (socket: AuthenticatedSocket): void => {
  socket.on(ChatEventEnum.TYPING_EVENT, (chatId: string) => {
    socket.in(chatId).emit(ChatEventEnum.TYPING_EVENT, chatId);
  });
};

const mountParticipantStoppedTypingEvent = (
  socket: AuthenticatedSocket,
): void => {
  socket.on(ChatEventEnum.STOP_TYPING_EVENT, (chatId: string) => {
    socket.in(chatId).emit(ChatEventEnum.STOP_TYPING_EVENT, chatId);
  });
};

const initializeSocketIO = (io: Server): void => {
  io.on("connection", async (socket: Socket) => {
    const authenticatedSocket = socket as AuthenticatedSocket;

    try {
      const cookies = cookie.parseCookie(socket.handshake.headers?.cookie || "");

      let token = cookies?.accessToken;

      if (!token) {
        token = socket.handshake.auth?.token;
      }

      if (typeof token !== "string" || !token) {
        throw new ApiError(401, "Un-authorized handshake. Token is missing");
      }

      const secret = process.env.ACCESS_TOKEN_SECRET;

      if (!secret) {
        throw new ApiError(500, "Access token secret is missing");
      }

      const decodedToken = jwt.verify(token, secret);

      if (
        typeof decodedToken === "string" ||
        typeof decodedToken._id !== "string"
      ) {
        throw new ApiError(401, "Invalid access token");
      }

      const user = await User.findById(
        (decodedToken as DecodedToken)._id,
      ).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
      );

      if (!user) {
        throw new ApiError(404, "User not found");
      }

      authenticatedSocket.user = user;

      socket.join(user._id.toString());

      socket.emit(ChatEventEnum.CONNECTED_EVENT);

      console.log("User connected 🗼. userId: ", user._id.toString());

      mountJoinChat(authenticatedSocket);
      mountParticipantTypingEvent(authenticatedSocket);
      mountParticipantStoppedTypingEvent(authenticatedSocket);

      socket.on(ChatEventEnum.DISCONNECT_EVENT, () => {
        console.log(
          "User has disconnected 🚫. userId: ",
          authenticatedSocket.user?._id,
        );

        if (authenticatedSocket.user?._id) {
          socket.leave(authenticatedSocket.user._id.toString());
        }
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Something went wrong while connecting to the socket.";

      socket.emit(ChatEventEnum.SOCKET_ERROR_EVENT, errorMessage);

      socket.disconnect(true);
    }
  });
};

const emitSocketEvent = (
  req: Request,
  roomId: string | Types.ObjectId,
  event: (typeof ChatEventEnum)[keyof typeof ChatEventEnum],
  payload: unknown,
): void => {
  console.log("🔍 Emitting to room:", roomId.toString());
  console.log("🔍 Event:", event);

  const io = req.app.get("io") as Server;

  io.in(roomId.toString()).emit(event, payload);
};

export { initializeSocketIO, emitSocketEvent };
