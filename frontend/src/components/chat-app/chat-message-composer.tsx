"use client";

import React, { useRef, useState } from "react";
import { z } from "zod";
import { useChat } from "@/context/chat-context";
import {
  Composer,
  ComposerActions,
  ComposerActionGroup,
  ComposerInput,
  ComposerSubmit,
  type ComposerValue,
  getComposerText,
} from "@/components/ui/composer";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Paperclip, ArrowUp, X, Image as ImageIcon } from "lucide-react";

// ── Zod schema ──────────────────────────────────────────────────────────────
const MAX_ATTACHMENTS = 5;

const composerSchema = z
  .object({
    message: z.string().optional(),
    attachments: z.array(z.instanceof(File)).max(MAX_ATTACHMENTS).optional(),
  })
  .superRefine((data, ctx) => {
    const hasText = (data.message ?? "").trim().length > 0;
    const hasImages = (data.attachments ?? []).length > 0;
    if (!hasText && !hasImages) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please enter a message or attach an image.",
        path: ["message"],
      });
    }
  });

export function ChatMessageComposer() {
  const { sendMessage, sendTyping, sendStopTyping, activeChatId } = useChat();
  const [draft, setDraft] = useState<ComposerValue>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleInputChange = (val: ComposerValue) => {
    setDraft(val);
    // Clear validation error when user starts typing
    if (validationError) setValidationError(null);

    const text = getComposerText(val).trim();
    if (!text) {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
        typingTimerRef.current = null;
      }
      sendStopTyping();
      return;
    }

    // Typing debounce logic
    sendTyping();
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }
    typingTimerRef.current = setTimeout(() => {
      sendStopTyping();
    }, 1500);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files);

    // Split into valid images and rejected files
    const valid = selected.filter((f) => f.type.startsWith("image/"));
    const invalid = selected.filter((f) => !f.type.startsWith("image/"));

    // Build the new combined list (respect MAX_ATTACHMENTS cap)
    const combined = [...attachments, ...valid].slice(0, MAX_ATTACHMENTS);

    // Determine which error to show (non-image takes priority over cap)
    if (invalid.length > 0) {
      setValidationError(
        `Only image files are allowed. ${invalid.length} file(s) were rejected.`,
      );
    } else if (attachments.length + valid.length > MAX_ATTACHMENTS) {
      setValidationError(`You can attach up to ${MAX_ATTACHMENTS} images.`);
    } else {
      setValidationError(null);
    }

    if (combined.length > attachments.length) {
      setAttachments(combined);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
    // Clear cap-related error once a slot frees up
    if (validationError?.includes("up to")) setValidationError(null);
  };

  const handleSend = async () => {
    const text = getComposerText(draft).trim();
    if (isSending || !activeChatId) return;

    // Zod validation — gates sendMessage
    const result = composerSchema.safeParse({
      message: text || undefined,
      attachments: attachments.length > 0 ? attachments : undefined,
    });

    if (!result.success) {
      setValidationError(result.error.issues[0]?.message ?? "Invalid input.");
      return;
    }

    setValidationError(null);

    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }

    setIsSending(true);
    try {
      await sendMessage(text || undefined, attachments.length > 0 ? attachments : undefined);
      setDraft([]);
      setAttachments([]);
    } finally {
      setIsSending(false);
    }
  };

  const hasContent = getComposerText(draft).trim().length > 0 || attachments.length > 0;

  return (
    <div className="p-3 border-t bg-card/40 backdrop-blur-sm shrink-0">
      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 px-1">
          {attachments.map((file, idx) => (
            <div
              key={idx}
              className="flex items-center gap-1.5 bg-muted px-2.5 py-1 rounded-md text-xs border max-w-xs truncate"
            >
              <ImageIcon className="size-3.5 text-muted-foreground shrink-0" />
              <span className="truncate">{file.name}</span>
              <button
                type="button"
                onClick={() => removeAttachment(idx)}
                className="text-muted-foreground hover:text-foreground ml-1"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Inline validation error */}
      {validationError && (
        <p className="text-xs text-destructive px-1 mb-1">{validationError}</p>
      )}

      <Composer
        value={draft}
        onValueChange={handleInputChange}
        onSubmit={handleSend}
        className="rounded-xl border shadow-xs bg-background"
      >
        <ComposerInput
          placeholder="Type a message... (Press Enter to send, Shift+Enter for new line)"
          className="min-h-11 max-h-32 text-sm"
        />

        <ComposerActions className="p-2 border-t flex items-center justify-between">
          <ComposerActionGroup>
            <input
              type="file"
              multiple
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              className="size-8 rounded-full text-muted-foreground hover:text-foreground"
              title="Add attachments (up to 5)"
              disabled={isSending || attachments.length >= 5}
            >
              <Paperclip className="size-4" />
            </Button>
          </ComposerActionGroup>

          <ComposerActionGroup>
            <ComposerSubmit
              disabled={!hasContent || isSending}
              className="size-8 rounded-full"
            >
              {isSending ? (
                <Spinner className="size-4" />
              ) : (
                <ArrowUp className="size-4" />
              )}
            </ComposerSubmit>
          </ComposerActionGroup>
        </ComposerActions>
      </Composer>
    </div>
  );
}
