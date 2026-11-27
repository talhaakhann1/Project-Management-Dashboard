import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Chat } from "../models/chat.model.js";
import { Message } from "../models/message.model.js";
import mongoose from "mongoose";
import { removeLocalFile } from "../utils/helper.js";
import { getLocalPath } from "../utils/helper.js";
import { emitSocketEvent } from "../socket/index.js";
import { ChatEventEnum } from "../types/enums/chat.enum.js";
import { uploadAtCloudinary } from "../utils/cloudinary.js";
import type { Request, Response } from "express";

const chatMessageCommonAggregation = () => {
  return [
    {
      $lookup: {
        from: "users",
        foreignField: "_id",
        localField: "sender",
        as: "sender",
        pipeline: [
          {
            $project: {
              fullName: 1,
              avatar: 1,
              email: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        sender: { $first: "$sender" },
      },
    },
  ];
};

const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  const { chatId } = req.params;
  const { content } = req.body;

  if (typeof chatId !== "string") {
    throw new ApiError(400, "chatId is undefined");
  }

  const hasAttachments =
    !Array.isArray(req.files) && !!req.files?.attachments?.length;

  if (!content?.trim() && !hasAttachments) {
    throw new ApiError(400, "Message content or attachment is required");
  }

  const selectedChat = await Chat.findById(chatId);
  if (!selectedChat) {
    throw new ApiError(404, "Chat does not exist");
  }
  const messageFiles: { localPath: string; url: string }[] = [];
  if (hasAttachments && !Array.isArray(req.files)) {
    const rawFiles = req.files?.attachments ?? [];

    const uploadResults = await Promise.allSettled(
      rawFiles.map((attachment) =>
        uploadAtCloudinary(getLocalPath(attachment.filename)),
      ),
    );

    for (const result of uploadResults) {
      if (result.status === "fulfilled" && result.value) {
        const cloudUrl = result.value.secure_url;
        messageFiles.push({
          url: cloudUrl,
          localPath: "", 
        });
      }
    }

    if (rawFiles.length > 0 && messageFiles.length === 0) {
      throw new ApiError(
        400,
        "Something went wrong in uploading files on Cloudinary",
      );
    }
  }

  const message = await Message.create({
    sender: new mongoose.Types.ObjectId(req.user._id),
    content,
    chat: new mongoose.Types.ObjectId(chatId),
    attachments: messageFiles || [],
  });

  if (!message) {
    throw new ApiError(400, "Something went wrong in creating message");
  }

  const chat = await Chat.findByIdAndUpdate(
    chatId,
    {
      $set: {
        lastMessage: message._id,
      },
    },
    {
      new: true,
    },
  );
  if (!chat) {
    throw new ApiError(400, "Something went wrong in updating message");
  }

  const messages = await Message.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(message._id),
      },
    },
    ...chatMessageCommonAggregation(),
  ]);
  const receivedMessage = messages[0];

  if (!receivedMessage) {
    throw new ApiError(500, "Internal server error");
  }
  console.log(chat.participants);

  chat.participants.forEach((participantObjectId) => {
    if (participantObjectId.toString() == req.user._id.toString()) return;
    emitSocketEvent(
      req,
      participantObjectId.toString(),
      ChatEventEnum.MESSAGE_RECEIVED_EVENT,
      receivedMessage,
    );
  });

  return res
    .status(201)
    .json(new ApiResponse(201, receivedMessage, "Message saved successfully"));
});

const deleteMessage = asyncHandler(async (req, res) => {
  const { messageId, chatId } = req.params;

  if (typeof messageId !== "string") {
    throw new ApiError(400, "messageId is required");
  }

  if (typeof chatId !== "string") {
    throw new ApiError(400, "chatId is required");
  }

  const chat = await Chat.findOne({
    _id: new mongoose.Types.ObjectId(chatId),
    participants: req.user?._id,
  });

  if (!chat) {
    throw new ApiError(400, "chat does not exist");
  }

  const message = await Message.findById(messageId);

  if (!message) {
    throw new ApiError(400, "message not found");
  }

  if (message.sender) {
    if (message?.sender.toString() !== req.user._id.toString()) {
      throw new ApiError(
        404,
        "You are not the authorised to delete the message, you are not the sender",
      );
    }
  }

  if (message.attachments && message.attachments.length > 0) {
    message.attachments.forEach((asset) => {
      if (asset.localPath) {
        removeLocalFile(asset.localPath);
      }
    });
  }

  await Message.deleteOne({ _id: new mongoose.Types.ObjectId(messageId) });

  if (chat?.lastMessage?.toString() === message._id.toString()) {
    const lastMessage = await Message.findOne(
      { chat: chatId },
      {},
      { sort: { createdAt: -1 } },
    );

    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: lastMessage ? lastMessage?._id : null,
    });
  }

  chat.participants.forEach((participantObjectId) => {
    if (participantObjectId.toString() === req.user._id.toString()) return;
    emitSocketEvent(
      req,
      participantObjectId.toString(),
      ChatEventEnum.MESSAGE_DELETE_EVENT,
      message,
    );
  });

  return res
    .status(200)
    .json(new ApiResponse(200, message, "Message deleted successfully"));
});

const getAllMessages = asyncHandler(async (req: Request, res: Response) => {
  const { chatId } = req.params;

  if (typeof chatId !== "string") {
    throw new ApiError(400, "chatId is required");
  }

  const page =
    typeof req.query.page === "string" ? Math.max(1, parseInt(req.query.page, 10) || 1) : 1;

  const limit =
    typeof req.query.limit === "string" ? Math.max(1, parseInt(req.query.limit, 10) || 10) : 10;
  const skip = (page - 1) * limit;

  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw new ApiError(404, "chat does not exist");
  }
  if (!chat.participants?.includes(req.user?._id)) {
    throw new ApiError(400, "User is not a part of this chat");
  }
  const messages = await Message.aggregate([
    {
      $match: {
        chat: new mongoose.Types.ObjectId(chatId),
      },
    },
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
    ...chatMessageCommonAggregation(),
  ]);

  if (!messages) {
    throw new ApiError(400, "Something went wrong in getting all messages");
  }

  const totalMessages = await Message.countDocuments({ chat: chatId });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        messages: messages || [],
        currentPage: page,
        totalPages: Math.ceil(totalMessages / limit),
        totalMessages,
      },
      "Messages fetched successfully",
    ),
  );
});

export { sendMessage, deleteMessage, getAllMessages };
