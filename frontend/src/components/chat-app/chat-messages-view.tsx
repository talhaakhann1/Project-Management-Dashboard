"use client";

import React, { useState } from "react";
import { useChat } from "@/context/chat-context";
import { ChatConversation } from "@/components/chat/chat-conversation";
import { ChatMessage } from "@/components/chat/chat-message";
import { ChatMessageText } from "@/components/chat/chat-message-text";
import { ChatTypingIndicator } from "@/components/chat/chat-typing-indicator";
import { ChatEmptyState, ChatLoadingState } from "@/components/chat/chat-states";
import { useChatScroll } from "@/components/chat/hooks/use-chat-scroll";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquare, Trash2 } from "lucide-react";
import type { Message, MessageAttachment } from "@/types/chat";
import { useAppSelector } from "@/store/hook";
import { AttachmentGrid, AttachmentLightbox } from "./attachment-viewer";

export function ChatMessagesView() {
  const user  = useAppSelector((state) => state.auth.user);
  const {
    messages,
    activeChat,
    isLoadingMessages,
    isTypingMap,
    deleteMessage,
  } = useChat();

  const isTyping = activeChat ? isTypingMap[activeChat._id] : false;

  const scroll = useChatScroll({
    itemCount: messages.length + (isTyping ? 1 : 0),
  });

  // Lightbox state: { attachments, startIndex } | null
  const [lightbox, setLightbox] = useState<{
    attachments: MessageAttachment[];
    startIndex: number;
  } | null>(null);

  if (!activeChat) return null;

  const formatMessageTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col relative bg-background">
      {/* Lightbox overlay — rendered at top level, outside scroll container */}
      {lightbox && (
        <AttachmentLightbox
          attachments={lightbox.attachments}
          startIndex={lightbox.startIndex}
          onClose={() => setLightbox(null)}
        />
      )}

      <ChatConversation
        scroll={scroll}
        label={`Chat with ${activeChat.name}`}
        jumpLabel="Jump to latest"
        className="size-full"
        contentClassName="p-4 space-y-3"
      >
        {isLoadingMessages ? (
          <ChatLoadingState label="Loading messages..." />
        ) : messages.length === 0 ? (
          <ChatEmptyState
            title="No messages yet"
            description="Send a message to start the conversation."
            icon={<MessageSquare className="size-6 text-muted-foreground" />}
          />
        ) : (
          messages.map((msg: Message, index: number) => {
            const currentUserId = user?.id || (user as { _id?: string })?._id;
            const senderId = msg.sender?._id || (msg.sender as { id?: string })?.id;
            const isOwn = senderId === currentUserId;
            const prevMsg = index > 0 ? messages[index - 1] : null;
            const prevSenderId = prevMsg?.sender?._id || (prevMsg?.sender as { id?: string })?.id;
            const isGrouped = prevSenderId === senderId;
            const senderDisplayName = msg.sender?.fullName || msg.sender?.username || "User";
            const hasAttachments = msg.attachments && msg.attachments.length > 0;

            return (
              <ChatMessage
                key={msg._id}
                side={isOwn ? "outgoing" : "incoming"}
                author={!isOwn && activeChat.isGroupChat ? senderDisplayName : undefined}
                avatar={
                  !isOwn ? (
                    <Avatar className="size-8">
                      <AvatarImage src={msg.sender?.avatar?.url} alt={senderDisplayName} />
                      <AvatarFallback className="text-[10px]">
                        {senderDisplayName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ) : undefined
                }
                grouped={isGrouped}
                footer={
                  <span className="text-[10px] text-muted-foreground/70 px-1">
                    {formatMessageTime(msg.createdAt)}
                  </span>
                }
                actions={
                  isOwn ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMessage(msg._id)}
                      className="size-6 rounded-full text-muted-foreground hover:text-destructive transition-colors"
                      title="Delete message"
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  ) : undefined
                }
              >
                {msg.content && (
                  <ChatMessageText text={msg.content} />
                )}

                {hasAttachments && (
                  <AttachmentGrid
                    attachments={msg.attachments}
                    onOpen={(idx) =>
                      setLightbox({ attachments: msg.attachments, startIndex: idx })
                    }
                  />
                )}
              </ChatMessage>
            );
          })
        )}

        {/* Typing Indicator */}
        <ChatTypingIndicator
          visible={isTyping}
          label="Someone is typing..."
          className="pt-1"
        />
      </ChatConversation>
    </div>
  );
}

