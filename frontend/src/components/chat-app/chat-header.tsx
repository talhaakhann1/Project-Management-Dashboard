"use client";

import React from "react";
import { useChat } from "@/context/chat-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Info } from "lucide-react";
import type { Chat } from "@/types/chat";
import { useAppSelector } from "@/store/hook";

interface ChatHeaderProps {
  onBack?: () => void;
}

export function ChatHeader({ onBack }: ChatHeaderProps) {
  const user = useAppSelector((state)=>state.auth.user);
  const { activeChat, isTypingMap } = useChat();

  if (!activeChat) return null;

  const isTyping = isTypingMap[activeChat._id];

  const getChatDisplayName = (chat: Chat) => {
    if (chat.isGroupChat) return chat.name;
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

  const displayName = getChatDisplayName(activeChat);
  const avatarInfo = getChatAvatar(activeChat);

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b bg-card/40 backdrop-blur-sm z-10 shrink-0">
      <div className="flex items-center gap-3">
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="md:hidden size-8 -ml-1 text-muted-foreground"
          >
            <ArrowLeft className="size-5" />
          </Button>
        )}

        <Avatar className="size-10">
          <AvatarImage src={avatarInfo.url} alt={displayName} />
          <AvatarFallback className={avatarInfo.isGroup ? "bg-primary/10 text-primary" : ""}>
            {avatarInfo.isGroup ? <Users className="size-4" /> : avatarInfo.fallback}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-sm leading-tight text-foreground">
              {displayName}
            </h2>
            {activeChat.isGroupChat && (
              <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-4">
                {activeChat.participants.length} members
              </Badge>
            )}
          </div>

          <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
            {isTyping ? (
              <span className="text-primary font-medium animate-pulse">
                typing...
              </span>
            ) : activeChat.isGroupChat ? (
              <span>
                {activeChat.participants.map((p) => p.fullName || p.username).join(", ")}
              </span>
            ) : (
              <span>Direct message</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 text-muted-foreground">
        <Button variant="ghost" size="icon" className="size-8 rounded-full" title="Chat info">
          <Info className="size-4" />
        </Button>
      </div>
    </header>
  );
}
