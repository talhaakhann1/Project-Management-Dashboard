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

function TaskItem({
    task,
    isSelected,
    onSelect,
    onTaskClick,
    onStatusChange,
    onDelete,
}: TaskItemProps) {

    const router = useRouter()
    const overdue = isOverdue(task.dueDate);

    const handleSelect = async (taskId: string) => {
        router.push(`/dashboard/tasks/${taskId}`)
    }

    return (
        <div
            className={cn(
                "group flex items-start gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-accent ",
                isSelected && "border-primary bg-primary/5",
            )}
        >
            <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => onSelect(task.id, checked === true)}
                onClick={(e) => e.stopPropagation()}
            />
            <div className="flex min-w-0 flex-1 items-start gap-3">
                <button
                    className="flex min-w-0 flex-1 items-start gap-3 text-left"
                    onClick={() => {
                        router.push(`/dashboard/tasks/${task.id}`);
                    }}
                    type="button"
                >
                    {task.status === "done" ? (
                        <CheckCircle2
                            className={cn(
                                "mt-0.5 size-5 shrink-0",
                                getStatusColor(task.status)
                            )}
                        />
                    ) : task.status === "in_progress" ? (
                        <Clock
                            className={cn(
                                "mt-0.5 size-5 shrink-0",
                                getStatusColor(task.status)
                            )}
                        />
                    ) : task.status === "cancelled" ? (
                        <Circle className={cn(
                            "mt-0.5 size-5 shrink-0",
                            getStatusColor(task.status)
                        )} />
                    ) : (
                        <Circle
                            className={cn(
                                "mt-0.5 size-5 shrink-0",
                                getStatusColor(task.status)
                            )}
                        />
                    )}
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                        <h4 className="wrap-break-word font-medium text-sm leading-tight">
                            {task.title}
                        </h4>
                        {task.description && (
                            <p className="line-clamp-2 text-muted-foreground text-xs">
                                {task.description}
                            </p>
                        )}
                        <div className="flex flex-wrap items-center gap-2">
                            <div
                                className={cn(
                                    "size-2 rounded-full",
                                    getPriorityColor(task.priority)
                                )}
                                title={getPriorityLabel(task.priority)}
                            />
                            {task.assignees && task.assignees.length > 0 && (
                                <div className="flex items-center gap-1">
                                    <User className="size-3 text-muted-foreground" />
                                    <div className="flex -space-x-2">
                                        {task.assignees.slice(0, 3).map((assignee) => (
                                            <Avatar
                                                className="size-6 border-2 border-background"
                                                key={assignee.id}
                                            >
                                                <AvatarImage alt={assignee.fullName} src={assignee.avatar?.url} />
                                                <AvatarFallback className="text-xs">
                                                    {getInitials(assignee.fullName)}
                                                </AvatarFallback>
                                            </Avatar>
                                        ))}
                                        {task.assignees.length > 3 && (
                                            <div className="flex size-5 items-center justify-center rounded-full border-2 border-background bg-muted text-muted-foreground text-xs">
                                                +{task.assignees.length - 3}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            {task.dueDate && (
                                <div
                                    className={cn(
                                        "flex items-center gap-1 text-xs",
                                        overdue ? "text-destructive" : "text-muted-foreground"
                                    )}
                                >
                                    <Calendar className="size-3" />
                                    <span>{formatDate(task.dueDate)}</span>
                                </div>
                            )}
                            {task.project && (
                                <div className="flex flex-wrap gap-1">
                                    <Badge className="text-xs" key={task.project.id} variant="secondary">
                                        {task.project.name}
                                    </Badge>
                                </div>
                            )}
                        </div>
                    </div>
                </button>
                <div className="flex shrink-0 items-center">
                    <div onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                            <DropdownMenuTrigger aria-label={`More options for ${task.title}`}
                                className="opacity-0 transition-opacity group-hover:opacity-100 inline-flex size-9 items-center justify-center rounded-md hover:bg-accent"
                                onClick={(e) => e.stopPropagation()}>
                                <MoreVertical className="size-4" />

                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleSelect(task.id)}>
                                    <Circle className="size-4" />
                                    Open
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onStatusChange(task.id, "todo")}>
                                    <Circle className="size-4" />
                                    Mark as To Do
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => onStatusChange(task.id, "in_progress")}
                                >
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
            </div>
        </div >
    );
}

export default function TaskList({
    tasks = [],
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
    const router = useRouter()


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

        if (statusFilter !== "all") {
            filtered = filtered.filter((task) => task.status === statusFilter);
        }

        if (priorityFilter !== "all") {
            filtered = filtered.filter((task) => task.priority === priorityFilter);
        }

        filtered.sort((a, b) => {
            switch (sortBy) {
                case "title":
                    return a.title.localeCompare(b.title);
                case "priority": {
                    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
                    return (
                        (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0)
                    );
                }
                case "dueDate":
                    if (!(a.dueDate || b.dueDate)) return 0;
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return a.dueDate.getTime() - b.dueDate.getTime();
                case "updated":
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
            if (selected) {
                next.add(taskId);
            } else {
                next.delete(taskId);
            }
            return next;
        });
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedTasks(new Set(paginatedTasks.map((t) => t.id)));
        } else {
            setSelectedTasks(new Set());
        }
    };

    const handleStatusChange = async (taskId: string, status: TaskStatus) => {
        await onTaskStatus?.(taskId, status)
    };

    const handleBulkAction = async (action: string) => {
        if (selectedTasks.size === 0) return;
        await onBulkAction?.(Array.from(selectedTasks), action);
        setSelectedTasks(new Set());
    };

    const allSelected =
        paginatedTasks.length > 0 &&
        paginatedTasks.every((t) => selectedTasks.has(t.id));
    const someSelected = paginatedTasks.some((t) => selectedTasks.has(t.id));

    return (
        <div className="mx-auto flex w-full mt-5 mb-5 max-w-7xl flex-col gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <CardTitle className="text-xl font-semibold sm:text-2xl">
                        Tasks
                    </CardTitle>
                    <CardDescription>
                        {filteredTasks.length} task
                        {filteredTasks.length !== 1 ? "s" : ""}
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
            {
                showSearch && (
                    <InputGroup>
                        <InputGroupAddon>
                            <Search className="size-4" />
                        </InputGroupAddon>
                        <InputGroupInput
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search tasks…"
                            type="search"
                            value={searchQuery}
                        />
                        {searchQuery && (
                            <Button
                                aria-label="Clear search"
                                className="absolute top-1/2 right-2 -translate-y-1/2"
                                onClick={() => setSearchQuery("")}
                                size="icon"
                                type="button"
                                variant="ghost"
                            >
                                <X className="size-4" />
                            </Button>
                        )}
                    </InputGroup>
                )
            }
            {
                showFilters && (
                    <div className="flex flex-wrap items-center gap-2">
                        <Select onValueChange={(value) => setStatusFilter(value ?? "all")} value={statusFilter}>
                            <SelectTrigger className="w-full sm:w-[140px]">
                                <Filter className="size-4" />
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
                        <Select onValueChange={(value) => setStatusFilter(value ?? "low")} value={priorityFilter}>
                            <SelectTrigger className="w-full sm:w-[140px]">
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
                        <Select onValueChange={(value) => setStatusFilter(value ?? "-1")} value={sortBy}>
                            <SelectTrigger className="w-fit">
                                <SortAsc className="size-4" />
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="updated">Last Updated</SelectItem>
                                <SelectItem value="title">Title</SelectItem>
                                <SelectItem value="priority">Priority</SelectItem>
                                <SelectItem value="dueDate">Due Date</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )
            }
            {
                showBulkActions && selectedTasks.size > 0 && (
                    <div className="flex items-center gap-2 rounded-lg border bg-muted/30 p-2">
                        <span className="text-muted-foreground text-sm">
                            {selectedTasks.size} selected
                        </span>
                        <Separator orientation="vertical" />
                        <div className="flex gap-1">
                            <Button
                                onClick={() => handleBulkAction("complete")}
                                size="sm"
                                type="button"
                                variant="outline"
                            >
                                Complete
                            </Button>
                            <Button
                                onClick={() => handleBulkAction("delete")}
                                size="sm"
                                type="button"
                                variant="outline"
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                )
            }
            {
                paginatedTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
                        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                            <Circle className="size-6 text-muted-foreground" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <p className="font-medium text-sm">
                                {searchQuery ||
                                    statusFilter !== "all" ||
                                    priorityFilter !== "all"
                                    ? "No tasks match your filters"
                                    : "No tasks yet"}
                            </p>
                            <p className="text-muted-foreground text-sm">
                                {onCreateTask
                                    ? "Create your first task to get started"
                                    : "Tasks will appear here"}
                            </p>
                        </div>
                        {onCreateTask && (
                            <Button onClick={() => setCreateDialogOpen(true)} type="button" variant="outline">
                                <Plus className="size-4" />
                                Create Task
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {showBulkActions && (
                            <div className="flex items-center gap-2 px-1">
                                <Checkbox
                                    checked={allSelected}
                                    onCheckedChange={handleSelectAll}
                                />
                                <span className="text-muted-foreground text-xs">
                                    Select all
                                </span>
                            </div>
                        )}
                        {paginatedTasks.map((task) => (
                            <TaskItem
                                key={task.id}
                                isSelected={selectedTasks.has(task.id)}
                                onSelect={handleTaskSelect}
                                onStatusChange={handleStatusChange}
                                onTaskClick={onTaskSelect || (() => { })}
                                task={task}
                            />
                        ))}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 pt-4">
                                <Button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    size="sm"
                                    type="button"
                                    variant="outline"
                                >
                                    Previous
                                </Button>
                                <span className="text-muted-foreground text-sm">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <Button
                                    disabled={currentPage >= totalPages}
                                    onClick={() =>
                                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                                    }
                                    size="sm"
                                    type="button"
                                    variant="outline"
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </div>
                )
            }

        </div >
    );
}

