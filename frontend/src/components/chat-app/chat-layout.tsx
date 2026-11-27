"use client";

import React, { useState } from "react";
import { useChat } from "@/context/chat-context";
import { ChatSidebar } from "./chat-sidebar";
import { ChatHeader } from "./chat-header";
import { ChatMessagesView } from "./chat-messages-view";
import { ChatMessageComposer } from "./chat-message-composer";
import { NewChatDialog } from "./new-chat-dialog";
import { ChatEmptyState } from "@/components/chat/chat-states";
import { MessageSquare, AlertCircle, X } from "lucide-react";

export function ChatLayout() {
  const { activeChatId, setActiveChatId, error, clearError } = useChat();
  const [newChatOpen, setNewChatOpen] = useState(false);

  return (
    <div className="flex h-[89vh] max-w-7xl overflow-hidden bg-background text-foreground antialiased">
      {/* Toast Error Alert */}
      {error && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-destructive text-destructive-foreground px-4 py-2.5 shadow-lg text-sm animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="size-4 shrink-0" />
          <span>{error}</span>
          <button
            onClick={clearError}
            className="ml-2 rounded-full p-0.5 hover:bg-destructive-foreground/20"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* Sidebar: on mobile, hidden if a chat is active */}
      <div
        className={`h-full w-full md:w-auto shrink-0 ${
          activeChatId ? "hidden md:flex" : "flex"
        }`}
      >
        <ChatSidebar onOpenNewChat={() => setNewChatOpen(true)} />
      </div>

      {/* Main Conversation Area: on mobile, hidden if no chat is active */}
      <main
        className={`flex-1 flex-col h-full min-w-0 ${
          activeChatId ? "flex" : "hidden md:flex"
        }`}
      >
        {activeChatId ? (
          <>
            <ChatHeader onBack={() => setActiveChatId(null)} />
            <ChatMessagesView />
            <ChatMessageComposer />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 bg-muted/10">
            <ChatEmptyState
              title="No conversation selected"
              description="Choose a conversation from the sidebar or start a new one to begin messaging."
              icon={<MessageSquare className="size-10 text-muted-foreground/40 stroke-1" />}
            />
          </div>
        )}
      </main>

      <NewChatDialog
        open={newChatOpen}
        onClose={() => setNewChatOpen(false)}
      />
    </div>
  );
}
