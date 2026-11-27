"use client";

import React, { useState } from "react";
import { useChat } from "@/context/chat-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Search,
  Plus,
  LogOut,
  Users,
  MessageSquare,
  Wifi,
  WifiOff,
} from "lucide-react";
import type { Chat } from "@/types/chat";
import { useAppSelector } from "@/store/hook";

interface ChatSidebarProps {
  onOpenNewChat: () => void;
}

export function ChatSidebar({ onOpenNewChat }: ChatSidebarProps) {
  const  user = useAppSelector((state)=>state.auth.user);
  const {
    chats,
    activeChatId,
    setActiveChatId,
    isLoadingChats,
    connectionStatus,
    isTypingMap,
  } = useChat();

  const [searchQuery, setSearchQuery] = useState("");

  const filteredChats = chats.filter((chat) => {
    if (!searchQuery) return true;
    const nameMatch = chat.name.toLowerCase().includes(searchQuery.toLowerCase());
    const participantMatch = chat.participants.some((p) =>
      (p.fullName || p.username || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
    return nameMatch || participantMatch;
  });

  const getChatDisplayName = (chat: Chat) => {
    if (chat.isGroupChat) return chat.name;
    // For 1-on-1, find the other participant
    const currentUserId = user?.id || (user as { _id?: string })?._id;
    const other = chat.participants.find(
      (p) => p._id !== currentUserId && p.id !== currentUserId
    );
    return other ? other.fullName : chat.name;
  };

  const getChatAvatar = (chat: Chat) => {
    if (chat.isGroupChat) {
      return {
        url: "",
        fallback: chat.name.slice(0, 2).toUpperCase(),
        isGroup: true,
      };
    }
    const currentUserId = user?.id || (user as { _id?: string })?._id;
    const other = chat.participants.find(
      (p) => p._id !== currentUserId && p.id !== currentUserId
    );
    return {
      url: other?.avatar?.url || "",
      fallback: (other?.fullName || "U").slice(0, 2).toUpperCase(),
      isGroup: false,
    };
  };

  const formatTimestamp = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <aside className="flex flex-col h-full w-full md:w-80 lg:w-96 border-r bg-card/60 backdrop-blur-sm select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2.5">
          <Avatar className="size-9 ring-1 ring-border">
            <AvatarImage src={user?.avatar?.url} alt={user?.fullName} />
            <AvatarFallback className="font-semibold text-xs">
              {(user?.fullName || "ME").slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-sm leading-tight">
              {user?.fullName}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              {connectionStatus === "connected" ? (
                <span className="flex items-center gap-1 text-[11px] text-emerald-500 font-medium">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              ) : connectionStatus === "connecting" ? (
                <span className="flex items-center gap-1 text-[11px] text-amber-500">
                  <Wifi className="size-3 animate-spin" />
                  Connecting
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] text-destructive">
                  <WifiOff className="size-3" />
                  Disconnected
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenNewChat}
            title="Start new conversation"
            className="rounded-full size-8 hover:bg-muted"
          >
            <Plus className="size-4" />
          </Button>
          {/* <Button
            variant="ghost"
            size="icon"
            onClick={() => logout()}
            title="Sign out"
            className="rounded-full size-8 hover:bg-muted text-muted-foreground hover:text-destructive"
          >
            <LogOut className="size-4" />
          </Button> */}
        </div>
      </div>

      {/* Search Input */}
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border bg-muted/50 px-9 py-2 text-sm outline-none placeholder:text-muted-foreground/70 focus:bg-background focus:ring-1 focus:ring-ring transition-colors"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto divide-y divide-border/40">
        {isLoadingChats ? (
          <div className="flex flex-col items-center justify-center p-8 gap-2">
            <Spinner className="size-6 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Loading chats...</p>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center gap-2">
            <MessageSquare className="size-8 text-muted-foreground/40 stroke-1" />
            <p className="text-sm font-medium text-muted-foreground">
              {searchQuery ? "No chats found" : "No conversations yet"}
            </p>
            <p className="text-xs text-muted-foreground/70">
              {searchQuery
                ? "Try searching for a different name"
                : "Click the + icon above to start chatting"}
            </p>
          </div>
        ) : (
          filteredChats.map((chat) => {
            const isSelected = chat._id === activeChatId;
            const chatName = getChatDisplayName(chat);
            const avatarInfo = getChatAvatar(chat);
            const isTyping = isTypingMap[chat._id];
            const lastMsg = chat.lastMessage;

            return (
              <div
                key={chat._id}
                onClick={() => setActiveChatId(chat._id)}
                className={`flex items-start gap-3 p-3.5 cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-muted/50"
                }`}
              >
                <Avatar className="size-10 mt-0.5 shrink-0">
                  <AvatarImage src={avatarInfo.url} alt={chatName} />
                  <AvatarFallback className={avatarInfo.isGroup ? "bg-primary/10 text-primary" : ""}>
                    {avatarInfo.isGroup ? <Users className="size-4" /> : avatarInfo.fallback}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-medium text-sm truncate leading-tight">
                      {chatName}
                    </span>
                    <span className="text-[11px] text-muted-foreground shrink-0">
                      {formatTimestamp(lastMsg?.createdAt || chat.updatedAt)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-1">
                    {isTyping ? (
                      <span className="text-xs text-primary font-medium italic animate-pulse">
                        typing...
                      </span>
                    ) : (
                      <p className="text-xs text-muted-foreground truncate leading-relaxed">
                        {lastMsg ? (
                          <>
                            {lastMsg.sender?.fullName && chat.isGroupChat ? (
                              <span className="font-medium text-foreground/80">
                                {lastMsg.sender.fullName}:{" "}
                              </span>
                            ) : null}
                            {lastMsg.content || (lastMsg.attachments?.length ? "📎 Attachment" : "")}
                          </>
                        ) : (
                          <span className="italic text-muted-foreground/60">No messages yet</span>
                        )}
                      </p>
                    )}

                    {chat.isGroupChat && (
                      <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 border-muted-foreground/30">
                        Group
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
