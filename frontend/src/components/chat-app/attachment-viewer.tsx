"use client";

import React, { useCallback, useEffect, useState } from "react";
import { X, Download, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, File as FileIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MessageAttachment } from "@/types/chat";

// ─── helpers ────────────────────────────────────────────────────────────────

const IMAGE_EXTS = /\.(jpeg|jpg|gif|png|webp|svg|bmp|avif)($|\?)/i;
const VIDEO_EXTS = /\.(mp4|webm|ogg|mov|mkv)($|\?)/i;

export type AttachmentKind = "image" | "video" | "file";

export function getAttachmentKind(url: string): AttachmentKind {
  if (IMAGE_EXTS.test(url)) return "image";
  if (VIDEO_EXTS.test(url)) return "video";
  return "file";
}

function getFileName(url: string): string {
  try {
    const parts = new URL(url).pathname.split("/");
    return decodeURIComponent(parts[parts.length - 1] || "file");
  } catch {
    return url.split("/").pop() ?? "file";
  }
}

// ─── Lightbox ────────────────────────────────────────────────────────────────

interface LightboxProps {
  attachments: MessageAttachment[];
  startIndex: number;
  onClose: () => void;
}

export function AttachmentLightbox({ attachments, startIndex, onClose }: LightboxProps) {
  const [index, setIndex] = useState(startIndex);
  const [zoom, setZoom] = useState(1);

  const current = attachments[index];
  const kind = current ? getAttachmentKind(current.url) : "file";
  const total = attachments.length;

  const prev = useCallback(() => {
    setZoom(1);
    setIndex((i) => (i > 0 ? i - 1 : total - 1));
  }, [total]);

  const next = useCallback(() => {
    setZoom(1);
    setIndex((i) => (i < total - 1 ? i + 1 : 0));
  }, [total]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, prev, next]);

  if (!current) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Top toolbar */}
      <div
        className="flex items-center justify-between px-4 py-2 shrink-0 bg-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-white/70 text-sm font-medium truncate max-w-xs">
          {getFileName(current.url)}
        </span>
        <div className="flex items-center gap-1">
          {kind === "image" && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="text-white/70 hover:text-white hover:bg-white/10 size-8"
                title="Zoom out"
                onClick={() => setZoom((z) => Math.max(0.3, z - 0.25))}
              >
                <ZoomOut className="size-4" />
              </Button>
              <span className="text-white/60 text-xs w-10 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="text-white/70 hover:text-white hover:bg-white/10 size-8"
                title="Zoom in"
                onClick={() => setZoom((z) => Math.min(4, z + 0.25))}
              >
                <ZoomIn className="size-4" />
              </Button>
            </>
          )}
          <a
            href={current.url}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center size-8 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            title="Download"
          >
            <Download className="size-4" />
          </a>
          <Button
            variant="ghost"
            size="icon"
            className="text-white/70 hover:text-white hover:bg-white/10 size-8"
            title="Close (Esc)"
            onClick={onClose}
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div
        className="flex-1 flex items-center justify-center min-h-0 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Prev / Next */}
        {total > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 text-white/70 hover:text-white hover:bg-white/10 size-10"
              onClick={prev}
            >
              <ChevronLeft className="size-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 text-white/70 hover:text-white hover:bg-white/10 size-10"
              onClick={next}
            >
              <ChevronRight className="size-6" />
            </Button>
          </>
        )}

        {kind === "image" && (
          <img
            src={current.url}
            alt={getFileName(current.url)}
            className="max-w-full max-h-full object-contain select-none transition-transform duration-150"
            style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}
            draggable={false}
          />
        )}

        {kind === "video" && (
          <video
            src={current.url}
            controls
            autoPlay
            className="max-w-full max-h-full rounded-lg"
          />
        )}

        {kind === "file" && (
          <div className="flex flex-col items-center gap-4 text-white/80">
            <FileIcon className="size-16 text-white/40" />
            <p className="text-lg font-medium text-center px-4 break-all">
              {getFileName(current.url)}
            </p>
            <a
              href={current.url}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors"
            >
              <Download className="size-4" />
              Download file
            </a>
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {total > 1 && (
        <div
          className="flex items-center justify-center gap-2 py-3 shrink-0 bg-black/50 overflow-x-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {attachments.map((att, i) => {
            const k = getAttachmentKind(att.url);
            return (
              <button
                key={i}
                onClick={() => { setZoom(1); setIndex(i); }}
                className={`shrink-0 size-12 rounded-md overflow-hidden border-2 transition-colors ${
                  i === index ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                {k === "image" ? (
                  <img src={att.url} alt="" className="size-full object-cover" />
                ) : (
                  <div className="size-full bg-muted/30 flex items-center justify-center">
                    <FileIcon className="size-5 text-white/60" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Inline attachment grid ────────────────────────────────────────────────

interface AttachmentGridProps {
  attachments: MessageAttachment[];
  onOpen: (index: number) => void;
}

export function AttachmentGrid({ attachments, onOpen }: AttachmentGridProps) {
  if (!attachments.length) return null;

  const images = attachments.filter((a) => getAttachmentKind(a.url) === "image");
  const others = attachments.filter((a) => getAttachmentKind(a.url) !== "image");
  const totalImgs = images.length;

  return (
    <div className="flex flex-col gap-1.5 mt-2">
      {/* Image grid */}
      {totalImgs > 0 && (
        <div
          className={`grid gap-1 ${
            totalImgs === 1
              ? "grid-cols-1"
              : totalImgs === 2
              ? "grid-cols-2"
              : totalImgs === 3
              ? "grid-cols-3"
              : "grid-cols-2"
          } max-w-sm`}
        >
          {images.map((att) => {
            const globalIdx = attachments.indexOf(att);
            return (
              <button
                key={globalIdx}
                onClick={() => onOpen(globalIdx)}
                className={`group relative overflow-hidden rounded-lg border bg-muted/30 hover:opacity-90 transition-opacity ${
                  totalImgs === 1 ? "max-h-60" : "aspect-square"
                }`}
              >
                <img
                  src={att.url}
                  alt="Attachment"
                  className={`w-full object-cover ${totalImgs === 1 ? "max-h-60 h-auto" : "h-full"}`}
                />
                {/* Show +N overlay if more than 4 images */}
                {totalImgs > 4 && globalIdx === attachments.indexOf(images[3]) && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-semibold text-lg">
                    +{totalImgs - 4}
                  </div>
                )}
                <ZoomIn className="absolute bottom-1 right-1 size-4 text-white/0 group-hover:text-white/80 transition-colors drop-shadow-sm" />
              </button>
            );
          })}
        </div>
      )}

      {/* Non-image attachments */}
      {others.map((att) => {
        const globalIdx = attachments.indexOf(att);
        const k = getAttachmentKind(att.url);
        return k === "video" ? (
          <button
            key={globalIdx}
            onClick={() => onOpen(globalIdx)}
            className="relative max-w-sm rounded-lg overflow-hidden border group hover:opacity-90 transition-opacity"
          >
            <video src={att.url} className="w-full max-h-48 object-cover" muted />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <div className="size-10 rounded-full bg-white/90 flex items-center justify-center">
                <span className="text-black text-sm font-bold ml-0.5">▶</span>
              </div>
            </div>
          </button>
        ) : (
          <button
            key={globalIdx}
            onClick={() => onOpen(globalIdx)}
            className="flex items-center gap-2 p-2 rounded-md bg-muted/50 border text-xs hover:bg-muted transition-colors max-w-xs text-left"
          >
            <FileIcon className="size-4 shrink-0 text-primary" />
            <span className="truncate max-w-[200px]">
              {getFileName(att.url)}
            </span>
            <Download className="size-3 shrink-0 text-muted-foreground ml-auto" />
          </button>
        );
      })}
    </div>
  );
}
