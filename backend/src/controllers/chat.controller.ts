import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Chat } from "../models/chat.model.js";
import { User } from "../models/user.model.js";
import { Message } from "../models/message.model.js";
import mongoose, { Mongoose, type ObjectId } from "mongoose";
import { removeLocalFile } from "../utils/helper.js";
import { emitSocketEvent } from "../socket/index.js";
import { ChatEventEnum } from "../types/enums/chat.enum.js";
import type { Request, Response } from "express";

const chatCommonAggregation = () => {
  return [
    {
      $lookup: {
        from: "users",
        localField: "participants",
        foreignField: "_id",
        as: "participants",
        pipeline: [
          {
            $project: {
              password: 0,
              refreshToken: 0,
              forgotPasswordToken: 0,
              forgotPasswordExpiry: 0,
              emailVerificationToken: 0,
              emailVerificationExpiry: 0,
            },
          },
        ],
      },
    },

    // 🔹 populate lastMessage
    {
      $lookup: {
        from: "messages",
        localField: "lastMessage",
        foreignField: "_id",
        as: "lastMessage",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "sender",
              foreignField: "_id",
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
        ],
      },
    },

    {
      $addFields: {
        lastMessage: { $first: "$lastMessage" },
      },
    },
  ];
};

const deleteCascadeMessages = async (chatId: string) => {
  if (!chatId) {
    throw new ApiError(400, "chatId is not defined");
  }

  const messages = await Message.find({
    chat: new mongoose.Types.ObjectId(chatId),
  });

  const attachments = messages.flatMap((message) => message.attachments ?? []);

  attachments.forEach((attachment) => {
    if (attachment.localPath) {
      removeLocalFile(attachment.localPath);
    }
  });

  await Message.deleteMany({
    chat: new mongoose.Types.ObjectId(chatId),
  });
};

const createOrGetAOneOnOneChat = asyncHandler(
  async (req: Request, res: Response) => {
    const { receiverId } = req.params;

    if (typeof receiverId !== "string") {
      throw new ApiError(400, "receiverId must be a string");
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      throw new ApiError(404, "Receiver does not exist");
    }
    if (receiver._id.toString() === req.user._id.toString()) {
      throw new ApiError(400, "You cannot chat with yourself");
    }
    const chat = await Chat.aggregate([
      {
        $match: {
          isGroupChat: false,
          participants: {
            $all: [req.user._id, new mongoose.Types.ObjectId(receiverId)],
          },
        },
      },
      ...chatCommonAggregation(),
    ]);

    if (chat.length) {
      return res
        .status(200)
        .json(new ApiResponse(200, chat[0], "Chat retrieved successfully"));
    }

    const newChatInstance = await Chat.create({
      name: "One on one chat",
      participants: [req.user._id, new mongoose.Types.ObjectId(receiverId)],
      admin: req.user._id,
    });

    const createdChat = await Chat.aggregate([
      {
        $match: {
          _id: newChatInstance._id,
        },
      },
      ...chatCommonAggregation(),
    ]);
    const payload = createdChat[0];

    if (!payload) {
      throw new ApiError(500, "Internal server error");
    }

    payload.participants?.forEach((participant: ObjectId | string) => {
      if (participant.toString() === req.user._id.toString()) {
        return;
      }

      emitSocketEvent(
        req,
        participant.toString(),
        ChatEventEnum.NEW_CHAT_EVENT,
        payload,
      );
    });

    return res
      .status(201)
      .json(new ApiResponse(201, payload, "Chat retrieved successfully"));
  },
);

const deleteOneOnOneChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  if (typeof chatId !== "string") {
    throw new ApiError(400, "chatId is required");
  }

  const chat = await Chat.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(chatId),
      },
    },
    ...chatCommonAggregation(),
  ]);

  const payload = chat[0];

  if (!payload) {
    throw new ApiError(404, "Chat does not exist");
  }
  await Chat.findByIdAndDelete(chatId); 
  await deleteCascadeMessages(chatId);

  const otherParticipant = payload?.participants?.find(
    (participant: ObjectId | string) =>
      participant?.toString() !== req.user._id.toString(), 
  );

  emitSocketEvent(
    req,
    otherParticipant._id?.toString(),
    ChatEventEnum.LEAVE_CHAT_EVENT,
    payload,
  );

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Chat deleted successfully"));
});

const createAGroupChat = asyncHandler(async (req, res) => {
  const { name, participants } = req.body;

  if (participants.includes(req.user._id.toString())) {
    throw new ApiError(
      400,
      "Participants array should not contain the group creator",
    );
  }

  const members = [...new Set([...participants, req.user._id.toString()])];

  if (members.length < 3) {
    throw new ApiError(
      400,
      "Seems like you have passed duplicate participants.",
    );
  }

  const groupChat = await Chat.create({
    name,
    isGroupChat: true,
    participants: members,
    admin: new mongoose.Types.ObjectId(req.user._id),
    lastMessage: null,
  });

  const createdGroupChat = await Chat.aggregate([
    {
      $match: {
        _id: groupChat._id,
      },
    },
    ...chatCommonAggregation(),
  ]);

  const payload = createdGroupChat[0];

  if (!payload) {
    throw new ApiError(500, "Internal server error");
  }

  payload?.participants?.forEach((participant: ObjectId | string) => {
    if (participant.toString() === req.user._id.toString()) return; 
    emitSocketEvent(
      req,
      participant?.toString(),
      ChatEventEnum.NEW_CHAT_EVENT,
      payload,
    );
  });

  return res
    .status(201)
    .json(new ApiResponse(201, payload, "Group chat created successfully"));
});

const renameGroupChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const { name } = req.body;

  const updatedGroupChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      $set: {
        name,
      },
    },
    {
      new: true,
    },
  );
  if (!updatedGroupChat) {
    throw new ApiError(400, "chat does not exist");
  }
  const chat = await Chat.aggregate([
    {
      $match: {
        _id: updatedGroupChat._id,
      },
    },
    ...chatCommonAggregation(),
  ]);

  const payload = chat[0];

  if (!payload) {
    throw new ApiError(500, "Internal server error");
  }

  payload.participants?.forEach((participant: ObjectId) => {
    if (participant.toString() === req.user._id.toString()) return;

    emitSocketEvent(
      req,
      participant.toString(),
      ChatEventEnum.UPDATE_GROUP_NAME_EVENT,
      payload,
    );
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, chat[0], "Group chat name updated successfully"),
    );
});

const addNewParticipantInGroupChat = asyncHandler(async (req, res) => {
  const { chatId, participantId } = req.params;

  if (typeof chatId !== "string") {
    throw new ApiError(400, "chatId is required");
  }

  if (typeof participantId !== "string") {
    throw new ApiError(400, "chatId is required");
  }

  const groupChat = await Chat.findOne({
    _id: new mongoose.Types.ObjectId(chatId),
    isGroupChat: true,
  });
  if (!groupChat) {
    throw new ApiError(400, "Group chat does not exist");
  }
  console.log(groupChat);

  if (groupChat.admin?.toString() !== req.user._id.toString()) {
    throw new ApiError(404, "Unauthorized Request");
  }
  const existingParticipants = groupChat.participants;
  if (
    existingParticipants?.includes(new mongoose.Types.ObjectId(participantId))
  ) {
    throw new ApiError(409, "Participant already in a group chat");
  }

  const updatedGroupChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: {
        participants: participantId,
      },
    },
    { new: true },
  );

  if (!updatedGroupChat) {
    throw new ApiError(400, "Something went wrong in adding participant");
  }
  const chat = await Chat.aggregate([
    {
      $match: {
        _id: updatedGroupChat._id,
      },
    },
    ...chatCommonAggregation(),
  ]);
  const payload = chat[0];

  if (!payload) {
    throw new ApiError(500, "Internal server error");
  }

  emitSocketEvent(req, participantId, ChatEventEnum.JOIN_CHAT_EVENT, payload);

  return res
    .status(200)
    .json(new ApiResponse(200, payload, "Participant added successfully"));
});

const removeParticipantFromGroupChat = asyncHandler(async (req, res) => {
  const { chatId, participantId } = req.params;

  if (typeof chatId !== "string") {
    throw new ApiError(400, "chatId is required");
  }

  if (typeof participantId !== "string") {
    throw new ApiError(400, "chatId is required");
  }

  const groupChat = await Chat.findOne({
    _id: new mongoose.Types.ObjectId(chatId),
    isGroupChat: true,
  });

  if (!groupChat) {
    throw new ApiError(404, "Group chat does not exist");
  }

  if (groupChat.admin?.toString() !== req.user._id?.toString()) {
    throw new ApiError(404, "You are not an admin");
  }

  const existingParticipants = groupChat.participants;

  if (
    !existingParticipants?.includes(new mongoose.Types.ObjectId(participantId))
  ) {
    throw new ApiError(400, "Participant does not exist in the group chat");
  }

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: {
        participants: participantId,
      },
    },
    { new: true },
  );

  if (!updatedChat) {
    throw new ApiError(400, "Failed to update chat");
  }

  const chat = await Chat.aggregate([
    {
      $match: {
        _id: updatedChat._id,
      },
    },
    ...chatCommonAggregation(),
  ]);

  const payload = chat[0];

  if (!payload) {
    throw new ApiError(500, "Internal server error");
  }

  emitSocketEvent(req, participantId, ChatEventEnum.LEAVE_CHAT_EVENT, payload);

  return res
    .status(200)
    .json(new ApiResponse(200, payload, "Participant removed successfully"));
});
const leaveGroupChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  if (typeof chatId !== "string") {
    throw new ApiError(400, "chatId is required");
  }

  const groupChat = await Chat.findOne({
    _id: new mongoose.Types.ObjectId(chatId),
    isGroupChat: true,
  });

  if (!groupChat) {
    throw new ApiError(404, "Group chat does not exist");
  }

  const existingParticipants = groupChat.participants;

  console.log(existingParticipants);
  // check if the participant that is leaving the group, is part of the group
  if (!existingParticipants?.includes(req.user?._id)) {
    throw new ApiError(400, "You are not a part of this group chat");
  }

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: {
        participants: req.user?._id, 
      },
    },
    { new: true },
  );

  if (!updatedChat) {
    throw new ApiError(400, "Failed to update chat");
  }

  const chat = await Chat.aggregate([
    {
      $match: {
        _id: updatedChat._id,
      },
    },
    ...chatCommonAggregation(),
  ]);

  const payload = chat[0];

  if (!payload) {
    throw new ApiError(500, "Internal server error");
  }

  payload.participants?.forEach((participant: ObjectId) => {
    emitSocketEvent(
      req,
      participant?.toString(),
      ChatEventEnum.LEAVE_CHAT_EVENT,
      payload,
    );
  });

  return res
    .status(200)
    .json(new ApiResponse(200, payload, "Left a group successfully"));
});

const deleteGroupChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  if (typeof chatId !== "string") {
    throw new ApiError(400, "chatId is required");
  }

  const groupChat = await Chat.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(chatId),
        isGroupChat: true,
      },
    },
  ]);

  const chat = groupChat[0];

  if (!chat) {
    throw new ApiError(404, "Group chat does not exist");
  }

  if (chat.admin?.toString() !== req.user._id?.toString()) {
    throw new ApiError(404, "Only admin can delete the group");
  }

  await Chat.findByIdAndDelete(chatId);

  await deleteCascadeMessages(chatId);

  chat?.participants?.forEach((participant: ObjectId) => {
    if (participant.toString() === req.user._id.toString()) return;

    emitSocketEvent(
      req,
      participant.toString(),
      ChatEventEnum.LEAVE_CHAT_EVENT,
      chat,
    );
  });
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Group chat deleted successfully"));
});

const getGroupChatDetails = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  if (typeof chatId !== "string") {
    throw new ApiError(400, "chatId is required");
  }
  const groupChat = await Chat.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(chatId),
        isGroupChat: true,
      },
    },
    ...chatCommonAggregation(),
  ]);

  const chat = groupChat[0];

  if (!chat) {
    throw new ApiError(404, "Group chat does not exist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, chat, "Group chat fetched successfully"));
});

const changeAdmin = asyncHandler(async (req, res) => {
  const { userId, chatId } = req.params;

  const groupChat = await Chat.findById(chatId);
  if (!groupChat) {
    throw new ApiError(400, "groupChat not found");
  }

  if (groupChat.admin?.toString() !== req.user._id?.toString()) {
    throw new ApiError(404, "Only admin can change group onwership");
  }
  const updatedGroupChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      $set: {
        admin: userId,
      },
    },
    {
      new: true,
    },
  );

  if (!updatedGroupChat) {
    throw new ApiError(400, "Something went wrong in changing group admin");
  }
  const chat = await Chat.aggregate([
    {
      $match: {
        _id: updatedGroupChat._id,
      },
    },
    ...chatCommonAggregation(),
  ]);
  const payload = chat[0];
  if (!payload) {
    throw new ApiError(500, "Internal server error");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, chat[0], "Group chat name updated successfully"),
    );
});

const searchAvailableUsers = asyncHandler(async (req, res) => {
  const users = await User.aggregate([
    {
      $match: {
        _id: {
          $ne: req.user._id,
        },
      },
    },
    {
      $project: {
        avatar: 1,
        fullName: 1,
        email: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, users, "Users fetched successfully"));
});

const getAllChats = asyncHandler(async (req, res) => {
  const chats = await Chat.aggregate([
    {
      $match: {
        participants: { $elemMatch: { $eq: req.user._id } }, 
      },
    },
    {
      $sort: {
        updatedAt: -1,
      },
    },
    ...chatCommonAggregation(),
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, chats || [], "User chats fetched successfully!"),
    );
});

export {
  createOrGetAOneOnOneChat,
  createAGroupChat,
  deleteOneOnOneChat,
  renameGroupChat,
  getAllChats,
  changeAdmin,
  addNewParticipantInGroupChat,
  removeParticipantFromGroupChat,
  searchAvailableUsers,
  leaveGroupChat,
  deleteGroupChat,
  getGroupChatDetails,
};
