"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useChat } from "@/context/chat-context";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { X, Users, UserPlus } from "lucide-react";
import type { User } from "@/types/chat";

interface NewChatDialogProps {
  open: boolean;
  onClose: () => void;
}

export function NewChatDialog({ open, onClose }: NewChatDialogProps) {
  const { createOneOnOneChat, createGroupChat } = useChat();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [mode, setMode] = useState<"direct" | "group">("direct");
  const [groupName, setGroupName] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setIsLoadingUsers(true);
    setError(null);
    setSelectedUserIds([]);
    setGroupName("");
    api
      .searchUsers()
      .then((data) => setUsers(data))
      .catch((err) => setError(err.message))
      .finally(() => setIsLoadingUsers(false));
  }, [open]);

  if (!open) return null;

  const toggleSelectUser = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleStartDirectChat = async (userId: string) => {
    setSubmitting(true);
    setError(null);
    try {
      await createOneOnOneChat(userId);
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) {
      setError("Please provide a group name");
      return;
    }
    if (selectedUserIds.length < 2) {
      setError("Select at least 2 participants for a group chat");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await createGroupChat(groupName.trim(), selectedUserIds);
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-xl flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between pb-4 border-b">
          <div className="flex items-center gap-2">
            {mode === "direct" ? (
              <UserPlus className="size-5 text-primary" />
            ) : (
              <Users className="size-5 text-primary" />
            )}
            <h3 className="font-semibold text-lg">
              {mode === "direct" ? "New Conversation" : "New Group Chat"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-muted-foreground hover:bg-accent"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex p-1 bg-muted rounded-lg my-4">
          <button
            type="button"
            onClick={() => {
              setMode("direct");
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
              mode === "direct"
                ? "bg-background shadow-xs text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Direct Message
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("group");
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
              mode === "group"
                ? "bg-background shadow-xs text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Group Chat
          </button>
        </div>

        {error && (
          <div className="mb-3 rounded-lg bg-destructive/10 p-2.5 text-xs text-destructive border border-destructive/20">
            {error}
          </div>
        )}

        {mode === "group" && (
          <div className="mb-3 space-y-1">
            <label className="text-xs font-medium text-foreground">
              Group Name
            </label>
            <input
              type="text"
              placeholder="e.g. Design Team"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="text-[11px] text-muted-foreground">
              Selected: {selectedUserIds.length} participant(s) (min 2 required)
            </p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-1.5 my-2 pr-1">
          {isLoadingUsers ? (
            <div className="flex justify-center py-8">
              <Spinner className="size-6 text-muted-foreground" />
            </div>
          ) : users.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              No other users found.
            </p>
          ) : (
            users.map((u) => {
              const uId = u.id || u._id || "";
              const isSelected = selectedUserIds.includes(uId);
              return (
                <div
                  key={uId}
                  onClick={() =>
                    mode === "direct"
                      ? handleStartDirectChat(uId)
                      : toggleSelectUser(uId)
                  }
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-accent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9">
                      <AvatarImage src={u.avatar?.url} alt={u.fullName} />
                      <AvatarFallback>
                        {u.fullName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium leading-none">
                        {u.fullName}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {u.email}
                      </p>
                    </div>
                  </div>
                  {mode === "group" && (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="size-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  )}
                </div>
              );
            })
          )}
        </div>

        {mode === "group" && (
          <div className="pt-4 border-t flex justify-end gap-2 mt-auto">
            <Button variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateGroup}
              disabled={submitting || selectedUserIds.length < 2 || !groupName.trim()}
              className="gap-2"
            >
              {submitting && <Spinner className="size-4" />}
              Create Group
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
