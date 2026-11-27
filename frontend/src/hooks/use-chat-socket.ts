"use client";

import { useEffect, useRef } from "react";
import { getSocket } from "@/lib/socket";
import type { Chat, Message, RawDeletedMessage } from "@/types/chat";

export type SocketConnectionStatus =
  | "connected"
  | "connecting"
  | "disconnected"
  | "error";

interface UseChatSocketOptions {
  isLoggedIn: boolean | false;
  activeChatId: string | null;
  onConnected?: () => void;
  onSocketError?: (error: string) => void;
  onDisconnect?: () => void;
  onMessageReceived?: (message: Message) => void;
  onMessageDeleted?: (deletedMessage: RawDeletedMessage) => void;
  onNewChat?: (chat: Chat) => void;
  onJoinChatEvent?: (chat: Chat) => void;
  onLeaveChat?: (chat: Chat) => void;
  onUpdateGroupName?: (chat: Chat) => void;
  onTyping?: (chatId: string) => void;
  onStopTyping?: (chatId: string) => void;
}

export function useChatSocket({
  isLoggedIn,
  activeChatId,
  onConnected,
  onSocketError,
  onDisconnect,
  onMessageReceived,
  onMessageDeleted,
  onNewChat,
  onJoinChatEvent,
  onLeaveChat,
  onUpdateGroupName,
  onTyping,
  onStopTyping,
}: UseChatSocketOptions) {
  // Use refs for callbacks so effect listeners don't rebind on every render
  const callbacksRef = useRef({
    onConnected,
    onSocketError,
    onDisconnect,
    onMessageReceived,
    onMessageDeleted,
    onNewChat,
    onJoinChatEvent,
    onLeaveChat,
    onUpdateGroupName,
    onTyping,
    onStopTyping,
  });

  useEffect(() => {
    callbacksRef.current = {
      onConnected,
      onSocketError,
      onDisconnect,
      onMessageReceived,
      onMessageDeleted,
      onNewChat,
      onJoinChatEvent,
      onLeaveChat,
      onUpdateGroupName,
      onTyping,
      onStopTyping,
    };
  });

  // Socket Connection and Global Listeners
  useEffect(() => {
    if (!isLoggedIn) return;

    const socket = getSocket(isLoggedIn);

    const handleConnected = () => {
      callbacksRef.current.onConnected?.();
    };

    const handleSocketError = (err: string) => {
      callbacksRef.current.onSocketError?.(err);
    };

    const handleDisconnect = () => {
      callbacksRef.current.onDisconnect?.();
    };

    const handleMessageReceived = (message: Message) => {
      callbacksRef.current.onMessageReceived?.(message);
    };

    const handleMessageDeleted = (deletedMessage: RawDeletedMessage) => {
      callbacksRef.current.onMessageDeleted?.(deletedMessage);
    };

    const handleNewChat = (chat: Chat) => {
      callbacksRef.current.onNewChat?.(chat);
    };

    const handleJoinChatEvent = (chat: Chat) => {
      callbacksRef.current.onJoinChatEvent?.(chat);
    };

    const handleLeaveChat = (chat: Chat) => {
      callbacksRef.current.onLeaveChat?.(chat);
    };

    const handleUpdateGroupName = (chat: Chat) => {
      callbacksRef.current.onUpdateGroupName?.(chat);
    };

    const handleTyping = (chatId: string) => {
      callbacksRef.current.onTyping?.(chatId);
    };

    const handleStopTyping = (chatId: string) => {
      callbacksRef.current.onStopTyping?.(chatId);
    };

    socket.on("connect", handleConnected);
    socket.on("connected", handleConnected);
    socket.on("socketError", handleSocketError);
    socket.on("connect_error", (err) => handleSocketError(err?.message || "Connection error"));
    socket.on("disconnect", handleDisconnect);
    socket.on("messageReceived", handleMessageReceived);
    socket.on("messageDeleted", handleMessageDeleted);
    socket.on("newChat", handleNewChat);
    socket.on("joinChat", handleJoinChatEvent);
    socket.on("leaveChat", handleLeaveChat);
    socket.on("updateGroupName", handleUpdateGroupName);
    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);

    if (socket.connected) {
      handleConnected();
    } else {
      socket.connect();
    }

    return () => {
      socket.off("connect", handleConnected);
      socket.off("connected", handleConnected);
      socket.off("socketError", handleSocketError);
      socket.off("connect_error");
      socket.off("disconnect", handleDisconnect);
      socket.off("messageReceived", handleMessageReceived);
      socket.off("messageDeleted", handleMessageDeleted);
      socket.off("newChat", handleNewChat);
      socket.off("joinChat", handleJoinChatEvent);
      socket.off("leaveChat", handleLeaveChat);
      socket.off("updateGroupName", handleUpdateGroupName);
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
    };
  }, [isLoggedIn]);

  // Join Room for Typing Broadcasts on Active Chat Change
  useEffect(() => {
    if (!isLoggedIn || !activeChatId) return;

    const socket = getSocket(isLoggedIn);
    if (socket.connected) {
      socket.emit("joinChat", activeChatId);
    } else {
      const handleConnect = () => {
        socket.emit("joinChat", activeChatId);
      };
      socket.once("connected", handleConnect);
      socket.once("connect", handleConnect);
    }

    return () => {
      if (socket.connected) {
        socket.emit("leaveChat", activeChatId);
      }
    };
  }, [isLoggedIn, activeChatId]);

  const emitTyping = (chatId: string) => {
    const socket = getSocket(isLoggedIn);
    if (socket.connected) {
      socket.emit("typing", chatId);
    }
  };

  const emitStopTyping = (chatId: string) => {
    const socket = getSocket(isLoggedIn);
    if (socket.connected) {
      socket.emit("stopTyping", chatId);
    }
  };

  return {
    emitTyping,
    emitStopTyping,
  };
}
