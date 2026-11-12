"use client";

import {
    Calendar,
    CheckCircle2,
    Circle,
    Clock,
    Filter,
    Loader2,
    MoreVertical,
    Plus,
    Search,
    SortAsc,
    User,
    X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { CreateTask } from "@/app/(app)/dashboard/tasks/page";
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTaskSchema } from "@/Schemas/task.schema";
import * as  z from "zod";
import { Controller, useForm } from "react-hook-form";
import { Textarea } from "../ui/textarea";
import { TaskPriorityEnum, TaskStatusEnum } from "@/types/enums/task.enum";
import { Input } from "../ui/input";;
import { useRouter } from "next/navigation";
import { Skeleton } from "boneyard-js/react";
import { TasksListSkeleton } from "../skeletons/tasks-list-skeleton";

export type TaskStatus = "todo" | "in_progress" | "done" | "cancelled";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface TaskAssignee {
    id: string;
    fullName: string;
    avatar?: {
        url: string;
        localPath: string;
    };
}


export interface availableProjects {
    id: string,
    name: string,
}


export interface Task {
    id: string;
    title: string;
    description: string;
    status: TaskStatusEnum;
    priority: TaskPriorityEnum;
    dueDate?: Date;
    assignees?: TaskAssignee[];
    createdBy: {
        id: string;
        fullName: string;
        avatar?: {
            url: string;
            localPath: string;
        };
    };
    project: {
        id: string;
        name: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

export interface TaskListProps {
    tasks?: Task[];
    onTaskCreate?: (data: {
        title: string;
        description: string;
        status: TaskStatusEnum;
        priority: TaskPriorityEnum;
        dueDate?: Date;
        assignees?: TaskAssignee[];
        projectId?: string;
    }) => Promise<void>;
    loading?: boolean;
    onTaskSelect?: (taskId: string) => void;
    availableAssignees?: TaskAssignee[],
    availableProjects?: availableProjects[],
    onTaskStatus?: (taskId: string, status: TaskStatus) => Promise<void>;
    onTaskUpdate?: (taskId: string, updates: Partial<Task>) => Promise<void>;
    onTaskDelete?: (taskId: string) => Promise<void>;
    onBulkAction?: (taskIds: string[], action: string) => Promise<void>;
    onCreateTask?: (data: CreateTask) => Promise<void>;
    className?: string;
    showSearch?: boolean;
    showFilters?: boolean;
    showBulkActions?: boolean;
    itemsPerPage?: number;
}


function getInitials(name?: string): string {
    return (
        name
            ?.trim()
            .split(/\s+/)
            .map((n) => n[0])
            .join("")
            .toUpperCase() ?? ""
    );
}

function formatDate(date: Date): string {
    const now = new Date(date);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateOnly = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
    );

    if (dateOnly.getTime() === today.getTime()) {
        return "Today";
    }
    if (dateOnly.getTime() === tomorrow.getTime()) {
        return "Tomorrow";
    }

    const month = date.toLocaleString("en-US", { month: "short" });
    const day = date.getDate();
    return `${month} ${day}`;
}

// const handleDelete = async (taskId: string) => {

//             // console.log("onDelete is", onDelete);
//             await onDelete?.(taskId);

//     };

function getStatusIcon(status: TaskStatusEnum) {
    switch (status) {
        case "done":
            return CheckCircle2;
        case "in_progress":
            return Clock;
        case "cancelled":
            return X;
        default:
            return Circle;
    }
}

function getStatusColor(status: TaskStatusEnum): string {
    switch (status) {
        case "done":
            return "text-green-600";
        case "in_progress":
            return "text-blue-600";
        case "cancelled":
            return "text-muted-foreground";
        default:
            return "text-muted-foreground";
    }
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

function getPriorityLabel(priority: TaskPriority): string {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
}

function isOverdue(date?: Date): boolean {
    if (!date) return false;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const dueDate = new Date(date);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < now;
}

interface TaskItemProps {
    task: Task;
    isSelected: boolean;
    onSelect: (taskId: string, selected: boolean) => void;
    onTaskClick: (taskId: string) => void;
    onStatusChange: (taskId: string, status: TaskStatus) => Promise<void>;
    onDelete?: (taskId: string) => void;
}

// Drop-in replacement — preserves all props/logic/state, enhances visual design only.

function TaskItem({
    task,
    isSelected,
    onSelect,
    onTaskClick,
    onStatusChange,
    onDelete,
}: TaskItemProps) {
    const router = useRouter();
    const overdue = isOverdue(task.dueDate);

    const handleSelect = async (taskId: string) => {
        router.push(`/dashboard/tasks/${taskId}`);
    };

    // Priority config — pill label + color
    const priorityConfig: Record<string, { label: string; className: string }> = {
        urgent: { label: "Urgent", className: "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800" },
        high:   { label: "High",   className: "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800" },
        medium: { label: "Medium", className: "bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-400 dark:border-yellow-800" },
        low:    { label: "Low",    className: "bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-700" },
    };
    const priority = priorityConfig[task.priority] ?? priorityConfig.low;

    return (
        <div
            className={cn(
                "group relative flex items-start gap-3 rounded-xl border bg-card px-4 py-3.5 transition-colors hover:bg-accent/50",
                isSelected && "border-primary bg-primary/5 hover:bg-primary/5",
            )}
        >
            {/* Checkbox */}
            <div className="mt-0.5 shrink-0">
                <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => onSelect(task.id, checked === true)}
                    onClick={(e) => e.stopPropagation()}
                />
            </div>

            {/* Main content button */}
            <button
                className="flex min-w-0 flex-1 items-start gap-3 text-left"
                onClick={() => router.push(`/dashboard/tasks/${task.id}`)}
                type="button"
            >
                {/* Status icon */}
                <div className="mt-0.5 shrink-0">
                    {task.status === "done" ? (
                        <CheckCircle2 className={cn("size-[18px]", getStatusColor(task.status))} />
                    ) : task.status === "in_progress" ? (
                        <Clock className={cn("size-[18px]", getStatusColor(task.status))} />
                    ) : (
                        <Circle className={cn("size-[18px]", getStatusColor(task.status))} />
                    )}
                </div>

                {/* Text + meta */}
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <h4
                        className={cn(
                            "wrap-break-word text-sm font-medium leading-snug",
                            task.status === "done" && "text-muted-foreground line-through decoration-muted-foreground/50"
                        )}
                    >
                        {task.title}
                    </h4>

                    {task.description && (
                        <p className="line-clamp-1 text-xs text-muted-foreground/80">
                            {task.description}
                        </p>
                    )}

                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-2 pt-0.5">

                        {/* Priority pill */}
                        <span
                            className={cn(
                                "inline-flex h-5 items-center rounded-full border px-2 text-[11px] font-medium",
                                priority.className
                            )}
                        >
                            {priority.label}
                        </span>

                        {/* Project badge */}
                        {task.project && (
                            <Badge
                                className="h-5 rounded-full px-2 text-[11px] font-medium"
                                variant="secondary"
                            >
                                {task.project.name}
                            </Badge>
                        )}

                        {/* Due date */}
                        {task.dueDate && (
                            <div
                                className={cn(
                                    "flex items-center gap-1 text-[11px]",
                                    overdue
                                        ? "font-medium text-destructive"
                                        : "text-muted-foreground"
                                )}
                            >
                                <Calendar className="size-3" />
                                <span>{formatDate(task.dueDate)}</span>
                                {overdue && <span className="font-medium">· Overdue</span>}
                            </div>
                        )}

                        {/* Assignee avatars */}
                        {task.assignees && task.assignees.length > 0 && (
                            <div className="flex items-center gap-1.5">
                                <div className="flex -space-x-1.5">
                                    {task.assignees.slice(0, 3).map((assignee) => (
                                        <Avatar
                                            className="size-5 ring-2 ring-background"
                                            key={assignee.id}
                                        >
                                            <AvatarImage alt={assignee.fullName} src={assignee.avatar?.url} />
                                            <AvatarFallback className="bg-primary/10 text-primary text-[9px] font-medium">
                                                {getInitials(assignee.fullName)}
                                            </AvatarFallback>
                                        </Avatar>
                                    ))}
                                    {task.assignees.length > 3 && (
                                        <div className="flex size-5 items-center justify-center rounded-full ring-2 ring-background bg-muted text-muted-foreground text-[10px] font-medium">
                                            +{task.assignees.length - 3}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </button>

            {/* Overflow menu */}
            <div
                className="mt-0.5 shrink-0"
                onClick={(e) => e.stopPropagation()}
            >
                <DropdownMenu>
                    <DropdownMenuTrigger
                        aria-label={`More options for ${task.title}`}
                        className={cn(
                            "inline-flex size-7 items-center justify-center rounded-md text-muted-foreground",
                            "opacity-0 transition-opacity group-hover:opacity-100",
                            "hover:bg-muted hover:text-foreground focus-visible:opacity-100"
                        )}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <MoreVertical className="size-3.5" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onClick={() => handleSelect(task.id)}>
                            <Circle className="size-4" />
                            Open task
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onStatusChange(task.id, "todo")}>
                            <Circle className="size-4" />
                            Mark as To Do
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onStatusChange(task.id, "in_progress")}>
                            <Clock className="size-4" />
                            Mark as In Progress
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onStatusChange(task.id, "done")}>
                            <CheckCircle2 className="size-4" />
                            Mark as Done
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}

export default function TaskList({
    tasks = [],
    loading,
    onTaskSelect,
    onTaskStatus,
    onBulkAction,
    onCreateTask,
    availableAssignees,
    availableProjects,
    className,
    showSearch = true,
    showFilters = true,
    showBulkActions = true,
    itemsPerPage = 20,
}: TaskListProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [priorityFilter, setPriorityFilter] = useState<string>("all");
    const [sortBy, setSortBy] = useState<string>("updated");
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
    const [currentPage, setCurrentPage] = useState(1);
    const router = useRouter();

    const filteredTasks = useMemo(() => {
        let filtered = [...tasks];
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (task) =>
                    task.title.toLowerCase().includes(query) ||
                    task.description?.toLowerCase().includes(query)
            );
        }
        if (statusFilter !== "all") filtered = filtered.filter((t) => t.status === statusFilter);
        if (priorityFilter !== "all") filtered = filtered.filter((t) => t.priority === priorityFilter);
        filtered.sort((a, b) => {
            switch (sortBy) {
                case "title": return a.title.localeCompare(b.title);
                case "priority": {
                    const o = { urgent: 4, high: 3, medium: 2, low: 1 };
                    return (o[b.priority] || 0) - (o[a.priority] || 0);
                }
                case "dueDate":
                    if (!(a.dueDate || b.dueDate)) return 0;
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return a.dueDate.getTime() - b.dueDate.getTime();
                default:
                    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
            }
        });
        return filtered;
    }, [tasks, searchQuery, statusFilter, priorityFilter, sortBy]);

    const paginatedTasks = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredTasks.slice(start, start + itemsPerPage);
    }, [filteredTasks, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);

    const handleTaskSelect = (taskId: string, selected: boolean) => {
        setSelectedTasks((prev) => {
            const next = new Set(prev);
            selected ? next.add(taskId) : next.delete(taskId);
            return next;
        });
    };

    const handleSelectAll = (checked: boolean) => {
        setSelectedTasks(checked ? new Set(paginatedTasks.map((t) => t.id)) : new Set());
    };

    const handleStatusChange = async (taskId: string, status: TaskStatus) => {
        await onTaskStatus?.(taskId, status);
    };

    const handleBulkAction = async (action: string) => {
        if (selectedTasks.size === 0) return;
        await onBulkAction?.(Array.from(selectedTasks), action);
        setSelectedTasks(new Set());
    };

    const allSelected = paginatedTasks.length > 0 && paginatedTasks.every((t) => selectedTasks.has(t.id));
    const someSelected = paginatedTasks.some((t) => selectedTasks.has(t.id));
    const hasActiveFilters = searchQuery || statusFilter !== "all" || priorityFilter !== "all";

    return (
        <div className="mx-auto flex w-full mt-5 mb-5 max-w-7xl flex-col gap-5 px-4 sm:px-6 lg:px-8">

            {/* ── Header ───────────────────────────────────────── */}
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div className="flex flex-col gap-0.5">
                    <CardTitle className="text-2xl font-semibold tracking-tight">
                        Tasks
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                        {filteredTasks.length} task{filteredTasks.length !== 1 ? "s" : ""}
                        {hasActiveFilters ? " matched" : ""}
                    </CardDescription>
                </div>
                <Button
                    className="w-full shrink-0 md:w-auto"
                    type="button"
                    onClick={() => router.push("/dashboard/tasks/create")}
                >
                    <Plus className="size-4" />
                    New Task
                </Button>
            </div>

            {/* ── Search ───────────────────────────────────────── */}
            {showSearch && (
                <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                        <Search className="size-4 text-muted-foreground" />
                    </div>
                    <InputGroupInput
                        className="h-9 w-full rounded-md border bg-background pl-9 pr-9 text-sm shadow-none
                                   placeholder:text-muted-foreground/60
                                   focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search tasks…"
                        type="search"
                        value={searchQuery}
                    />
                    {searchQuery && (
                        <button
                            aria-label="Clear search"
                            className="absolute inset-y-0 right-2.5 flex items-center text-muted-foreground hover:text-foreground"
                            onClick={() => setSearchQuery("")}
                            type="button"
                        >
                            <X className="size-3.5" />
                        </button>
                    )}
                </div>
            )}

            {/* ── Filters ──────────────────────────────────────── */}
            {showFilters && (
                <div className="flex flex-wrap items-center gap-2">
                    <Select onValueChange={(v) => setStatusFilter(v ?? "all")} value={statusFilter}>
                        <SelectTrigger className="h-8 w-full gap-1.5 text-xs sm:w-[130px]">
                            <Filter className="size-3 text-muted-foreground" />
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="todo">To Do</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="done">Done</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select onValueChange={(v) => setPriorityFilter(v ?? "all")} value={priorityFilter}>
                        <SelectTrigger className="h-8 w-full gap-1.5 text-xs sm:w-[130px]">
                            <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Priorities</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select onValueChange={(v) => setSortBy(v ?? "updated")} value={sortBy}>
                        <SelectTrigger className="h-8 w-fit gap-1.5 text-xs">
                            <SortAsc className="size-3 text-muted-foreground" />
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="updated">Last Updated</SelectItem>
                            <SelectItem value="title">Title</SelectItem>
                            <SelectItem value="priority">Priority</SelectItem>
                            <SelectItem value="dueDate">Due Date</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Active filter indicator */}
                    {hasActiveFilters && (
                        <button
                            className="flex h-8 items-center gap-1 rounded-md px-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                            onClick={() => {
                                setSearchQuery("");
                                setStatusFilter("all");
                                setPriorityFilter("all");
                            }}
                            type="button"
                        >
                            <X className="size-3" />
                            Clear filters
                        </button>
                    )}
                </div>
            )}

            {/* ── List ─────────────────────────────────────────── */}
            {loading ? (
                <TasksListSkeleton />
            ) : paginatedTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-muted/20 py-16 text-center">
                    <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                        <Circle className="size-5 text-muted-foreground" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <p className="text-sm font-medium text-foreground">
                            {hasActiveFilters ? "No tasks match your filters" : "No tasks yet"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {onCreateTask ? "Create your first task to get started" : "Tasks will appear here"}
                        </p>
                    </div>
                    {onCreateTask && (
                        <Button
                            className="mt-1"
                            onClick={() => setCreateDialogOpen(true)}
                            size="sm"
                            type="button"
                            variant="outline"
                        >
                            <Plus className="size-3.5" />
                            Create Task
                        </Button>
                    )}
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    {/* Select-all row */}
                    {showBulkActions && (
                        <div className="flex items-center gap-2.5 px-1 pb-1">
                            <Checkbox
                                checked={allSelected}
                                onCheckedChange={handleSelectAll}
                            />
                            <span className="text-xs text-muted-foreground">
                                {someSelected
                                    ? `${selectedTasks.size} selected`
                                    : "Select all"}
                            </span>
                            {someSelected && (
                                <div className="ml-auto flex items-center gap-1.5">
                                    <Button
                                        className="h-7 text-xs"
                                        onClick={() => handleBulkAction("done")}
                                        size="sm"
                                        type="button"
                                        variant="outline"
                                    >
                                        <CheckCircle2 className="size-3.5" />
                                        Mark done
                                    </Button>
                                    <Button
                                        className="h-7 text-xs text-destructive hover:text-destructive"
                                        onClick={() => handleBulkAction("delete")}
                                        size="sm"
                                        type="button"
                                        variant="outline"
                                    >
                                        Delete
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Task items */}
                    {paginatedTasks.map((task) => (
                        <TaskItem
                            key={task.id}
                            isSelected={selectedTasks.has(task.id)}
                            onSelect={handleTaskSelect}
                            onStatusChange={handleStatusChange}
                            onTaskClick={onTaskSelect || (() => {})}
                            task={task}
                        />
                    ))}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 pt-2">
                            <Button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                size="sm"
                                type="button"
                                variant="outline"
                            >
                                Previous
                            </Button>
                            <span className="text-xs text-muted-foreground tabular-nums">
                                {currentPage} / {totalPages}
                            </span>
                            <Button
                                disabled={currentPage >= totalPages}
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                size="sm"
                                type="button"
                                variant="outline"
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}