"use client";

import {
    Calendar,
    Clock,
    FileText,
    MoreVertical,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Tabs,
    TabsContent,
} from "@/components/ui/tabs";
import { Project, ProjectStatus } from "@/types/enums/project.enum";
import ReactMarkdown from "react-markdown";
import { useRouter } from "next/navigation";
import { ProjectDetailSkeleton } from "../skeletons/project-detail-skeleton";



export interface ProjectDetailProps {
    project?: Project | null;
    isLoading: boolean;
    onUpdate?: (updates: Partial<Project>) => Promise<void>;
    onDelete?: (taskId: string) => Promise<void>;
    onCommentAdd?: (content: string) => Promise<void>;
    onAttachmentUpload?: (file: File) => Promise<void>;
    onSubprojectToggle?: (subprojectId: string, completed: boolean) => Promise<void>;
    onSubprojectAdd?: (name: string) => Promise<void>;
    className?: string;
}

function formatDate(date: Date): string {
    const parsedDate = date instanceof Date ? date : new Date(date);

    if (isNaN(parsedDate.getTime())) {
        return "Invalid date";
    }

    return new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",

    }
    ).format(parsedDate);
}

function formatDateTime(date: Date | string): string {
    const parsedDate = date instanceof Date ? date : new Date(date);

    if (isNaN(parsedDate.getTime())) {
        return "Invalid date";
    }

    return new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(parsedDate);
}



function getStatusLabel(status: ProjectStatus) {
    switch (status) {
        case "active":
            return "active";
        case "archived":
            return "archived";
        case "completed":
            return "completed";
    }
}

const tabValues = [
    "details",
    "subprojects",
    "comments",
    "attachments",
    "activity",
] as const;

function StatusBadge({ status }: { status: ProjectStatus }) {
  const map: Record<string, string> = {
    active:    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
    completed: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800",
    archived:  "bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-950/40 dark:text-slate-400 dark:border-slate-800",
    cancelled: "bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-950/40 dark:text-slate-400 dark:border-slate-800",
  };
  return (
    <span className={cn(
      "inline-flex h-5 items-center rounded-full border px-2 text-[11px] font-medium",
      map[status] ?? map.archived
    )}>
      {getStatusLabel(status)}
    </span>
  );
}



export default function ProjectDetail({
    project,
    isLoading,
    onUpdate,
    onDelete,
    className,
}: ProjectDetailProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(project?.name || "");
    const [editDescription, setEditDescription] = useState(
        project?.description || ""
    );
    const [commentText, setCommentText] = useState("");
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const router = useRouter()

    if (isLoading) {
        return (
            <ProjectDetailSkeleton />
        );
    }

    if (!project) {
        return (
            <Card className={cn("w-full shadow-xs", className)}>
                <CardContent className="flex items-center justify-center p-12">
                    <div className="flex flex-col items-center gap-4 text-center">
                        <FileText className="size-12 text-muted-foreground" />
                        <p className="text-muted-foreground text-sm">
                            This project doesn't exist or you don't have access to it.
                        </p>
                        <Button variant="outline" onClick={() => router.push("/dashboard/projects")}>
                            Back to projects
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }



    // const handleSave = async () => {
    //     await onUpdate?.({
    //         name: editTitle,
    //         description: editDescription,
    //     });
    //     setIsEditing(false);
    // };

    // const handleCancel = () => {
    //     setEditTitle(project.name);
    //     setEditDescription(project.description || "");
    //     setIsEditing(false);
    // };

    const handleDelete = async (taskId: string) => {
        await onDelete?.(taskId)
    }


    return (
            <div className="mx-auto mt-5 flex w-full max-w-7xl flex-col gap-5 px-4 sm:px-6 lg:px-8">

  {/* ── Header ── */}
  <div className="flex flex-wrap items-end justify-between gap-3 group">
    <div className="flex flex-col gap-0.5">
      <h1 className="text-2xl font-semibold tracking-tight">{project.name}</h1>
      <p className="text-sm text-muted-foreground">
        Created {formatDate(project.createdAt)}
        {project.dueDate && <> · Due {formatDate(project.dueDate)}</>}
      </p>
    </div>

    <DropdownMenu>
      <DropdownMenuTrigger render={
        <Button
          className="size-7 rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity hover:bg-muted hover:text-foreground"
          size="icon"
          type="button"
          variant="ghost"
        />
      }>
        <MoreVertical className="size-3.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} variant="destructive">
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>

  {/* ── Meta strip ── */}
  <div className="flex flex-wrap items-center gap-3">
    {/* Status pill */}
    <StatusBadge status={project.status} />

    {/* Deadline */}
    {project.dueDate && (
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Calendar className="size-3.5" />
        <span>{formatDate(project.dueDate)}</span>
      </div>
    )}

    {/* Updated */}
    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <Clock className="size-3.5" />
      <span>Updated {formatDateTime(project.updatedAt)}</span>
    </div>
  </div>

  {/* ── Description ── */}
  <div className="rounded-xl border bg-background shadow-sm overflow-hidden">
    <div className="border-b px-4 py-2.5">
      <span className="text-sm font-medium">Description</span>
    </div>
    <div className="prose prose-sm max-w-none p-4 text-sm text-muted-foreground">
      <ReactMarkdown>{project.description}</ReactMarkdown>
    </div>
  </div>

  {/* ── People ── */}
  <div className="grid gap-3 sm:grid-cols-2">

    {/* Created by */}
    <div className="rounded-xl border bg-background shadow-sm p-4 flex flex-col gap-3">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Created By
      </span>
      <div className="flex items-center gap-2">
        <Avatar className="size-6 ring-2 ring-background">
          <AvatarImage alt={project.createdBy.fullName} src={project.createdBy.avatar?.url} />
          <AvatarFallback className="bg-primary/10 text-primary text-[9px] font-medium">
            {project.createdBy.fullName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm">{project.createdBy.fullName}</span>
      </div>
    </div>

    {/* Members */}
    {project.members && project.members.length > 0 && (
      <div className="rounded-xl border bg-background shadow-sm p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Members
          </span>
          <span className="text-[11px] text-muted-foreground">
            {project.members.length} member{project.members.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center -space-x-1.5">
          {project.members.slice(0, 5).map((member) => (
            <Avatar key={member.id} className="size-6 ring-2 ring-background">
              <AvatarImage alt={member.fullName} src={member.avatar?.url} />
              <AvatarFallback className="bg-primary/10 text-primary text-[9px] font-medium">
                {member.fullName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ))}
          {project.members.length > 5 && (
            <div className="size-6 rounded-full ring-2 ring-background bg-muted text-muted-foreground text-[9px] font-medium flex items-center justify-center">
              +{project.members.length - 5}
            </div>
          )}
        </div>
      </div>
    )}
  </div>

</div>
  
    );
}
