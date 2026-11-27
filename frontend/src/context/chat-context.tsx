"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { api } from "@/lib/api";
import { useChatSocket, type SocketConnectionStatus } from "@/hooks/use-chat-socket";
import { getSocket } from "@/lib/socket";
import type { Chat, Message, RawDeletedMessage } from "@/types/chat";
import { useAppSelector } from "@/store/hook";

interface ChatContextType {
  chats: Chat[];
  activeChatId: string | null;
  activeChat: Chat | null;
  messages: Message[];
  isLoadingChats: boolean;
  isLoadingMessages: boolean;
  connectionStatus: SocketConnectionStatus;
  isTypingMap: Record<string, boolean>;
  setActiveChatId: (id: string | null) => void;
  refreshChats: () => Promise<void>;
  sendMessage: (content?: string, attachments?: File[]) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  createOneOnOneChat: (receiverId: string) => Promise<Chat>;
  createGroupChat: (name: string, participants: string[]) => Promise<Chat>;
  sendTyping: () => void;
  sendStopTyping: () => void;
  error: string | null;
  clearError: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, user } = useAppSelector((state)=>state.auth);

  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>({});
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<SocketConnectionStatus>(() => {
    if (!isLoggedIn) return "disconnected";
    const socket = getSocket(isLoggedIn);
    return socket.connected ? "connected" : "connecting";
  });
  const [isTypingMap, setIsTypingMap] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  // Load all chats
  const refreshChats = useCallback(async () => {
    if (!isLoggedIn) return;
    setIsLoadingChats(true);
    try {
      const data = await api.getAllChats();
      setChats(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setIsLoadingChats(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn) {
      const socket = getSocket(isLoggedIn);
      if (socket.connected) {
        setConnectionStatus("connected");
      }
      refreshChats();
    } else {
      setChats([]);
      setActiveChatId(null);
      setMessagesMap({});
      setConnectionStatus("disconnected");
    }
  }, [isLoggedIn, refreshChats]);

  // Load messages when active chat changes
  useEffect(() => {
    if (!activeChatId || !isLoggedIn) return;

    let isMounted = true;
    setIsLoadingMessages(true);

    api
      .getMessages(activeChatId, 1, 100)
      .then((data) => {
        if (!isMounted) return;
        // The API returns messages ordered createdAt DESC, reverse to ASC for chat stream
        const sorted = (data.messages || []).slice().reverse();
        setMessagesMap((prev) => ({
          ...prev,
          [activeChatId]: sorted,
        }));
      })
      .catch((err: unknown) => {
        if (err instanceof Error && isMounted) {
          setError(err.message);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingMessages(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [activeChatId, isLoggedIn]);

  // Socket callbacks
  const handleConnected = useCallback(() => {
    setConnectionStatus("connected");
  }, []);

  const handleSocketError = useCallback((err: string) => {
    setConnectionStatus("error");
    setError(err);
  }, []);

  const handleDisconnect = useCallback(() => {
    setConnectionStatus("disconnected");
  }, []);

  const handleMessageReceived = useCallback((newMessage: Message) => {
    setMessagesMap((prev) => {
      const chatMessages = prev[newMessage.chat] || [];
      // Prevent duplicates
      if (chatMessages.some((m) => m._id === newMessage._id)) {
        return prev;
      }
      return {
        ...prev,
        [newMessage.chat]: [...chatMessages, newMessage],
      };
    });

    // Update lastMessage on conversation in chat list
    setChats((prevChats) =>
      prevChats.map((c) =>
        c._id === newMessage.chat ? { ...c, lastMessage: newMessage } : c
      )
    );
  }, []);

  const handleMessageDeleted = useCallback((deleted: RawDeletedMessage) => {
    setMessagesMap((prev) => {
      const chatMessages = prev[deleted.chat] || [];
      return {
        ...prev,
        [deleted.chat]: chatMessages.filter((m) => m._id !== deleted._id),
      };
    });
  }, []);

  const handleNewChat = useCallback((newChat: Chat) => {
    setChats((prev) => {
      if (prev.some((c) => c._id === newChat._id)) return prev;
      return [newChat, ...prev];
    });
  }, []);

  const handleJoinChatEvent = useCallback((joinedChat: Chat) => {
    setChats((prev) => {
      const exists = prev.some((c) => c._id === joinedChat._id);
      if (exists) {
        return prev.map((c) => (c._id === joinedChat._id ? joinedChat : c));
      }
      return [joinedChat, ...prev];
    });
  }, []);

  const handleLeaveChat = useCallback(
    (leftChat: Chat) => {
      setChats((prev) => prev.filter((c) => c._id !== leftChat._id));
      if (activeChatId === leftChat._id) {
        setActiveChatId(null);
      }
    },
    [activeChatId]
  );

  const handleUpdateGroupName = useCallback((updated: Chat) => {
    setChats((prev) =>
      prev.map((c) => (c._id === updated._id ? { ...c, name: updated.name } : c))
    );
  }, []);

  const typingTimeoutRefs = React.useRef<Record<string, NodeJS.Timeout>>({});

  const handleTyping = useCallback((chatId: string) => {
    setIsTypingMap((prev) => ({ ...prev, [chatId]: true }));
    if (typingTimeoutRefs.current[chatId]) {
      clearTimeout(typingTimeoutRefs.current[chatId]);
    }
    // Automatically clear typing state after 3 seconds if stopTyping packet is lost
    typingTimeoutRefs.current[chatId] = setTimeout(() => {
      setIsTypingMap((prev) => ({ ...prev, [chatId]: false }));
    }, 3000);
  }, []);

  const handleStopTyping = useCallback((chatId: string) => {
    if (typingTimeoutRefs.current[chatId]) {
      clearTimeout(typingTimeoutRefs.current[chatId]);
      delete typingTimeoutRefs.current[chatId];
    }
    setIsTypingMap((prev) => ({ ...prev, [chatId]: false }));
  }, []);

  const { emitTyping, emitStopTyping } = useChatSocket({
    isLoggedIn,
    activeChatId,
    onConnected: handleConnected,
    onSocketError: handleSocketError,
    onDisconnect: handleDisconnect,
    onMessageReceived: handleMessageReceived,
    onMessageDeleted: handleMessageDeleted,
    onNewChat: handleNewChat,
    onJoinChatEvent: handleJoinChatEvent,
    onLeaveChat: handleLeaveChat,
    onUpdateGroupName: handleUpdateGroupName,
    onTyping: handleTyping,
    onStopTyping: handleStopTyping,
  });

  const sendTyping = useCallback(() => {
    if (activeChatId) {
      emitTyping(activeChatId);
    }
  }, [activeChatId, emitTyping]);

  const sendStopTyping = useCallback(() => {
    if (activeChatId) {
      emitStopTyping(activeChatId);
    }
  }, [activeChatId, emitStopTyping]);

  const sendMessage = async (content?: string, attachments?: File[]) => {
    if (!activeChatId) return;

    sendStopTyping();

    // Send via REST (per contract)
    const savedMessage = await api.sendMessage(activeChatId, content, attachments);

    // Append to local message list immediately for sender
    setMessagesMap((prev) => {
      const currentList = prev[activeChatId] || [];
      if (currentList.some((m) => m._id === savedMessage._id)) return prev;
      return {
        ...prev,
        [activeChatId]: [...currentList, savedMessage],
      };
    });

    // Update conversation lastMessage
    setChats((prev) =>
      prev.map((c) =>
        c._id === activeChatId ? { ...c, lastMessage: savedMessage } : c
      )
    );
  };

  const deleteMessage = async (messageId: string) => {
    if (!activeChatId) return;
    await api.deleteMessage(activeChatId, messageId);
    setMessagesMap((prev) => ({
      ...prev,
      [activeChatId]: (prev[activeChatId] || []).filter((m) => m._id !== messageId),
    }));
  };

  const createOneOnOneChat = async (receiverId: string) => {
    const chat = await api.createOrGetOneOnOneChat(receiverId);
    setChats((prev) => {
      if (prev.some((c) => c._id === chat._id)) return prev;
      return [chat, ...prev];
    });
    setActiveChatId(chat._id);
    return chat;
  };

  const createGroupChat = async (name: string, participants: string[]) => {
    const chat = await api.createGroupChat(name, participants);
    setChats((prev) => [chat, ...prev]);
    setActiveChatId(chat._id);
    return chat;
  };

  const activeChat = chats.find((c) => c._id === activeChatId) || null;
  const currentMessages = activeChatId ? messagesMap[activeChatId] || [] : [];

  return (
    <ChatContext.Provider
      value={{
        chats,
        activeChatId,
        activeChat,
        messages: currentMessages,
        isLoadingChats,
        isLoadingMessages,
        connectionStatus,
        isTypingMap,
        setActiveChatId,
        refreshChats,
        sendMessage,
        deleteMessage,
        createOneOnOneChat,
        createGroupChat,
        sendTyping,
        sendStopTyping,
        error,
        clearError,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
