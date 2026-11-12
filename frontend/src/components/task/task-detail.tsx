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
    CardDescription,
    CardHeader,
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
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
    Tabs,
    TabsContent,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { Task, TaskAssignee, TaskPriority, TaskStatus } from "./task-list";
import ReactMarkdown from "react-markdown";
import { useRouter } from "next/navigation";
import { TaskDetailSkeleton } from "../skeletons/task-detail-skeleton";
import { TaskStatusEnum } from "@/types/enums/task.enum";
import { ProjectStatus } from "../dashboard/performance-chart";


export interface Subtask {
    id: string;
    title: string;
    completed: boolean;
    dueDate?: Date;
}

export interface TaskDetailProps {
    task?: Task | null;
    isLoading: boolean;
    subtasks?: Subtask[];
    onUpdate?: (updates: Partial<Task>) => Promise<void>;
    onDelete?: (taskId: string) => Promise<void>;
    onCommentAdd?: (content: string) => Promise<void>;
    onAttachmentUpload?: (file: File) => Promise<void>;
    onSubtaskToggle?: (subtaskId: string, completed: boolean) => Promise<void>;
    onSubtaskAdd?: (title: string) => Promise<void>;
    className?: string;
}

function formatDate(date: Date): string {
    const parsedDate = date instanceof Date ? date : new Date(date);

    if (isNaN(parsedDate.getTime())) {
        return "Invalid date"; // or throw, or return "-"
    }

    return new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",

    }
    ).format(parsedDate);
}

function formatDateTime(date: Date | string): string {
    const parsedDate = date instanceof Date ? date : new Date(date);

    if (isNaN(parsedDate.getTime())) {
        return "Invalid date"; // or throw, or return "-"
    }

    return new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(parsedDate);
}

function getPriorityColor(priority: TaskPriority): string {
    switch (priority) {
        case "urgent":
            return "bg-red-500";
        case "high":
            return "bg-orange-500";
        case "medium":
            return "bg-yellow-500";
        default:
            return "bg-gray-500";
    }
}

function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const map: Record<TaskPriority, string> = {
    urgent: "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800",
    high:   "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800",
    medium: "bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-400 dark:border-yellow-800",
    low:    "bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-950/40 dark:text-slate-400 dark:border-slate-800",
  };
  return (
    <span className={cn(
      "inline-flex h-5 items-center rounded-full border px-2 text-[11px] font-medium capitalize",
      map[priority]
    )}>
      {priority}
    </span>
  );
}

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

function getStatusLabel(status: TaskStatusEnum) {
    switch (status) {
        case "todo":
            return "To Do";
        case "in_progress":
            return "In Progress";
        case "done":
            return "Done";
        case "cancelled":
            return "Cancelled";
    }
}

const tabValues = [
    "details",
    "subtasks",
    "comments",
    "attachments",
    "activity",
] as const;



export default function TaskDetail({
    task,
    subtasks = [],
    isLoading,
    onUpdate,
    onDelete,
    onCommentAdd,
    onAttachmentUpload,
    onSubtaskToggle,
    onSubtaskAdd,
    className,
}: TaskDetailProps) {
    //   const [activeTab, setActiveTab] = useQueryState("tab", parseTab);
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(task?.title || "");
    const [editDescription, setEditDescription] = useState(
        task?.description || ""
    );
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const router = useRouter()


    if (isLoading) {
        return (
            <TaskDetailSkeleton />
        );
    }

    // project doesn't exist / was deleted / bad id in the URL
    if (!task) {
        return (
            <Card className={cn("w-full shadow-xs", className)}>
                <CardContent className="flex items-center justify-center p-12">
                    <div className="flex flex-col items-center gap-4 text-center">
                        <FileText className="size-12 text-muted-foreground" />
                        <p className="text-muted-foreground text-sm">
                            This task doesn't exist or you don't have access to it.
                        </p>
                        <Button variant="outline" onClick={() => router.push("/dashboard/tasks")}>
                            Back to tasks
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }



    const handleSave = async () => {
        await onUpdate?.({
            title: editTitle,
            description: editDescription,
        });
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditTitle(task.title);
        setEditDescription(task.description || "");
        setIsEditing(false);
    };

    const handleDelete = async (taskId: string): Promise<void> => {
        await onDelete?.(taskId)
    }

    return (
        <>
            <div className="mx-auto mt-5 flex w-full max-w-7xl flex-col gap-5 px-4 sm:px-6 lg:px-8">

                {/* ── Header ── */}
                <div className="flex flex-wrap items-end justify-between gap-3 group">
                    <div className="flex flex-col gap-0.5">
                        {isEditing ? (
                            <div className="flex flex-col gap-3">
                                <Input className="w-full font-semibold text-lg" value={editTitle} />
                                <Textarea
                                    className="min-h-[140px] resize-none text-base"
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    value={editDescription}
                                />
                                <div className="flex gap-2">
                                    <Button onClick={handleSave} type="button">Save</Button>
                                    <Button onClick={handleCancel} type="button" variant="outline">Cancel</Button>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Project breadcrumb */}
                                <div className="flex items-center gap-1.5 mb-1">
                                    <span className="text-xs text-muted-foreground">Project</span>
                                    <span className="text-xs text-muted-foreground">/</span>
                                    <span className="text-xs font-medium text-foreground">{task.project.name}</span>
                                </div>
                                <h1 className="text-2xl font-semibold tracking-tight">{task.title}</h1>
                                <p className="text-sm text-muted-foreground">
                                    Created {formatDate(task.createdAt)}
                                    {task.dueDate && <> · Due {formatDate(task.dueDate)}</>}
                                </p>
                            </>
                        )}
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
                            <DropdownMenuItem onClick={() => setIsEditing(true)}>Edit</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} variant="destructive">
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* ── Meta strip ── */}
                {!isEditing && (
                    <div className="flex flex-wrap items-center gap-3">
                        <StatusBadge status={task.status} />
                        <PriorityBadge priority={task.priority} />
                        {task.dueDate && (
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <Calendar className="size-3.5" />
                                <span>{formatDate(task.dueDate)}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Clock className="size-3.5" />
                            <span>Updated {formatDateTime(task.updatedAt)}</span>
                        </div>
                    </div>
                )}

                {/* ── Description ── */}
                {!isEditing && (
                    <div className="rounded-xl border bg-background shadow-sm overflow-hidden">
                        <div className="border-b px-4 py-2.5">
                            <span className="text-sm font-medium">Description</span>
                        </div>
                        <div className="prose prose-sm max-w-none p-4 text-sm text-muted-foreground">
                            <ReactMarkdown>{task.description}</ReactMarkdown>
                        </div>
                    </div>
                )}

                {/* ── People ── */}
                {!isEditing && (
                    <div className="grid gap-3 sm:grid-cols-2">

                        {/* Created by */}
                        <div className="rounded-xl border bg-background shadow-sm p-4 flex flex-col gap-3">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                Created By
                            </span>
                            <div className="flex items-center gap-2">
                                <Avatar className="size-6 ring-2 ring-background">
                                    <AvatarImage alt={task.createdBy.fullName} src={task.createdBy.avatar?.url} />
                                    <AvatarFallback className="bg-primary/10 text-primary text-[9px] font-medium">
                                        {task.createdBy.fullName.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="text-sm">{task.createdBy.fullName}</span>
                            </div>
                        </div>

                        {/* Assignees */}
                        {task.assignees && task.assignees.length > 0 && (
                            <div className="rounded-xl border bg-background shadow-sm p-4 flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                        Assignees
                                    </span>
                                    <span className="text-[11px] text-muted-foreground">
                                        {task.assignees.length} assignee{task.assignees.length !== 1 ? "s" : ""}
                                    </span>
                                </div>
                                <div className="flex items-center -space-x-1.5">
                                    {task.assignees.slice(0, 5).map((assignee) => (
                                        <Avatar key={assignee.id} className="size-6 ring-2 ring-background">
                                            <AvatarImage alt={assignee.fullName} src={assignee.avatar?.url} />
                                            <AvatarFallback className="bg-primary/10 text-primary text-[9px] font-medium">
                                                {assignee.fullName.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    ))}
                                    {task.assignees.length > 5 && (
                                        <div className="size-6 rounded-full ring-2 ring-background bg-muted text-muted-foreground text-[9px] font-medium flex items-center justify-center">
                                            +{task.assignees.length - 5}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                    </div>
                )}

            </div>

            {/* ── Delete dialog ── */}
            <Dialog onOpenChange={setShowDeleteDialog} open={showDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Task</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this task? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2">
                        <Button onClick={() => setShowDeleteDialog(false)} type="button" variant="outline">
                            Cancel
                        </Button>
                        <Button
                            onClick={() => { handleDelete(task.id); setShowDeleteDialog(false); }}
                            type="button"
                            variant="destructive"
                        >
                            Delete
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
