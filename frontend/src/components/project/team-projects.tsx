"use client";

import {
    CheckCircle2,
    Circle,
    Clock,
    Folder,
    FolderOpen,
    Loader2,
    MoreVertical,
    Plus,
    Search,
    Trash2,
} from "lucide-react";
import { useState } from "react";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    CardContent,
    CardDescription,
    CardTitle,
} from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Empty,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as  z from "zod";
import { createProjectSchema } from "@/Schemas/project.schema";
import { Project } from "@/types/enums/project.enum";
import { useRouter } from "next/navigation";
import { ProjectsListSkeleton } from "../skeletons/projects-list-skeleton";
import { cn } from "@/lib/utils";

export interface TeamProject {
    id: string;
    name: string;
    description?: string;
    colour?: string;
    icon?: string;
    status: string;
    dueDate: string;
    members: {
        id: string;
        fullName: string;
        avatar?: {
            url: string;
            localPath: string;
        };
    }[];
    createdBy: {
        id: string,
        fullName: string,
        avatar?: {
            url: string;
            localPath: string;
        };
    }[];
    createdAt: Date;
    updatedAt: Date;
}

export interface availableMembers {
    id: string,
    fullName: string
}

export interface TeamProjectsProps {
    projects?: Project[] | [];
    loading?: boolean;
    availableMembers?: availableMembers[];
    currentUserId?: string;
    onCreate?: (data: {
        name: string;
        description?: string;
        colour?: string,
        members: string[]
    }) => Promise<void>;
    onUpdateStatus?: (projectId: string, status: string) => Promise<void>;
    onUpdate?: (projectId: string, data: Partial<TeamProject>) => Promise<void>;
    onDelete?: (projectId: string) => Promise<void>;
    onSelect?: (projectId: string) => void;
    className?: string;
    showSearch?: boolean;
}



function formatDate(date: Date): string {
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(date);
}

function formatNumber(num: number): string {
    if (num >= 1_000_000) {
        return `${(num / 1_000_000).toFixed(1)}M`;
    }
    if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
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

export default function TeamProjects({
    projects = [],
    loading,
    availableMembers = [],
    currentUserId,
    onCreate,
    onUpdate,
    onUpdateStatus,
    onDelete,
    onSelect,
    className,
    showSearch = true,
}: TeamProjectsProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const router = useRouter()


    const filteredProjects = projects?.filter((project) => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
            project.name.toLowerCase().includes(query) ||
            project.description?.toLowerCase().includes(query)
        );
    });


    const form = useForm<z.infer<typeof createProjectSchema>>({
        resolver: zodResolver(createProjectSchema),
        defaultValues: {
            name: "",
            description: "",
            colour: "#3b82f6",
            dueDate: "",
            members: []
        }
    })

    const onSubmit = async (data: z.infer<typeof createProjectSchema>) => {

        setIsCreating(true);
        console.log("Data", data);

        try {
            await onCreate?.(data);
            setCreateDialogOpen(false);
            form.reset();
        } finally {
            setIsCreating(false);
        }
    };

    const onStatusChange = async (projectId: string, status: string) => {
        console.log(projectId)
        setActionLoading(projectId);
        try {
            await onUpdateStatus?.(projectId, status);
        } finally {
            setActionLoading(null);
        }
    }

    const handleSelect = async (projectId: string) => {
        setActionLoading(projectId);
        try {
            router.push(`/dashboard/projects/${projectId}`)
        } finally {
            setActionLoading(null);
        }
    }
    const handleDelete = async (
        projectId: string
    ) => {
        console.log(projectId)
        setActionLoading(projectId);
        try {
            console.log("onDelete is", onDelete);
            await onDelete?.(projectId);
        } finally {
            setActionLoading(null);
        }
    };

    return (

        <div className="mx-auto flex w-full mt-5 max-w-7xl flex-col gap-5 px-4 sm:px-6 lg:px-8">

            {/* ── Header ─────────────────────────────────────────────────── */}
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div className="flex flex-col gap-0.5">
                    <CardTitle className="text-2xl font-semibold tracking-tight">
                        Projects
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                        {projects.length} project{projects.length !== 1 ? "s" : ""} in your team
                    </CardDescription>
                </div>
                <Button
                    className="w-full shrink-0 md:w-auto"
                    type="button"
                    onClick={() => router.push("/dashboard/projects/create")}
                >
                    <Plus className="size-4" />
                    New Project
                </Button>
            </div>

            {/* ── Search ─────────────────────────────────────────────────── */}
            {showSearch && (
                <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                        <Search className="size-4 text-muted-foreground" />
                    </div>
                    <InputGroupInput
                        className="h-9 w-full rounded-md border bg-background pl-9 pr-4 text-sm shadow-none
                   placeholder:text-muted-foreground/60
                   focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none
                   sm:max-w-xs"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setSearchQuery(e.target.value)
                        }
                        placeholder="Search projects…"
                        type="search"
                        value={searchQuery}
                    />
                </div>
            )}

            {/* ── Grid ───────────────────────────────────────────────────── */}
            <CardContent className="p-0">
                {loading ? (
                    <ProjectsListSkeleton />
                ) : filteredProjects.length === 0 ? (
                    /* ── Empty state ── */
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 py-16 text-center">
                        <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted">
                            <Folder className="size-5 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium text-foreground">
                            {searchQuery ? "No projects found" : "No projects yet"}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {searchQuery ? "Try a different search term" : "Create your first project to get started"}
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredProjects.map((project) => {

                            // Status config
                            const statusConfig: Record<string, { label: string; className: string }> = {
                                active: { label: "Active", className: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400" },
                                completed: { label: "Completed", className: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-400" },
                                archived: { label: "Archived", className: "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400" },
                            };
                            const status = statusConfig[project.status] ?? null;

                            return (
                                <div
                                    className="group relative flex flex-col gap-4 rounded-xl border bg-card p-4 transition-all
                         hover:border-primary/50 hover:shadow-sm cursor-pointer"
                                    key={project.id}
                                    onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                                >
                                    {/* ── Card header ── */}
                                    <div className="flex items-start justify-between gap-2">

                                        {/* Icon + name + status */}
                                        <div className="flex min-w-0 flex-1 items-start gap-3">
                                            {/* Colour icon chip */}
                                            <div
                                                className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg"
                                                style={{ backgroundColor: `${project.colour}18` }}
                                            >
                                                <Folder
                                                    className="size-4"
                                                    style={{ color: project.colour }}
                                                />
                                            </div>

                                            <div className="flex min-w-0 flex-1 flex-col gap-1">
                                                <h3 className="wrap-break-word text-sm font-semibold leading-snug text-foreground">
                                                    {project.name}
                                                </h3>
                                                {project.status && status && (
                                                    <span
                                                        className={cn(
                                                            "inline-flex h-5 w-fit items-center rounded-full border px-2 text-[11px] font-medium",
                                                            status.className
                                                        )}
                                                    >
                                                        {status.label}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Overflow menu */}
                                        <div onClick={(e) => e.stopPropagation()}>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger
                                                    aria-label={`More options for ${project.name}`}
                                                    className={cn(
                                                        "inline-flex size-7 items-center justify-center rounded-md text-muted-foreground",
                                                        "opacity-0 transition-opacity group-hover:opacity-100",
                                                        "hover:bg-muted hover:text-foreground focus-visible:opacity-100"
                                                    )}
                                                >
                                                    {actionLoading === project.id ? (
                                                        <Loader2 className="size-3.5 animate-spin" />
                                                    ) : (
                                                        <MoreVertical className="size-3.5" />
                                                    )}
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-44" sideOffset={4}>
                                                    <DropdownMenuItem onClick={() => handleSelect(project.id)}>
                                                        <FolderOpen className="size-4" />
                                                        Open project
                                                    </DropdownMenuItem>
                                                    {onUpdateStatus && (
                                                        <>
                                                            <DropdownMenuItem onClick={() => onStatusChange(project.id, "active")}>
                                                                <Circle className="size-4" />
                                                                Mark as Active
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem onClick={() => onStatusChange(project.id, "archived")}>
                                                                <Clock className="size-4" />
                                                                Mark as Archived
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem onClick={() => onStatusChange(project.id, "completed")}>
                                                                <CheckCircle2 className="size-4" />
                                                                Mark as Completed
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                    {onDelete && (
                                                        <>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() => handleDelete(project.id)}
                                                                variant="destructive"
                                                            >
                                                                <Trash2 className="size-4" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>

                                    {/* ── Description ── */}
                                    {project.description && (
                                        <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">
                                            {project.description}
                                        </p>
                                    )}

                                    {/* ── Footer: members ── */}
                                    <div className="mt-auto flex items-center justify-between pt-1">
                                        {project.members?.length > 0 ? (
                                            <div className="flex items-center gap-2">
                                                <div className="flex -space-x-1.5">
                                                    {project.members.slice(0, 4).map((member) => (
                                                        <Avatar
                                                            className="size-6 ring-2 ring-background"
                                                            key={member.id}
                                                        >
                                                            <AvatarImage alt={member.fullName} src={member.avatar?.url} />
                                                            <AvatarFallback className="bg-primary/10 text-primary text-[9px] font-medium">
                                                                {getInitials(member.fullName)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    ))}
                                                    {project.members.length > 4 && (
                                                        <div className="flex size-6 items-center justify-center rounded-full ring-2 ring-background bg-muted text-muted-foreground text-[10px] font-medium">
                                                            +{project.members.length - 4}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-[11px] text-muted-foreground">
                                                    {project.members.length} member{project.members.length !== 1 ? "s" : ""}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-[11px] text-muted-foreground/60">No members</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </div>
    );
}


