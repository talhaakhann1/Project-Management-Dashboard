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
        <div className="mx-auto flex w-full mt-5 max-w-7xl flex-col gap-4 px-4 sm:px-6 lg:px-8 ">
            <div className="flex flex-col gap-4">
                <div className="flex flex-col flex-wrap gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                        <CardTitle className="text-xl font-semibold sm:text-2xl">
                            Projects
                        </CardTitle>
                        <CardDescription>
                            {projects.length} project{projects.length !== 1 ? "s" : ""} in
                            your team
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
                {showSearch && (
                    <InputGroup>
                        <InputGroupAddon>
                            <Search className="size-4" />
                        </InputGroupAddon>
                        <InputGroupInput
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setSearchQuery(e.target.value)
                            }
                            placeholder="Search projects…"
                            type="search"
                            value={searchQuery}
                        />
                    </InputGroup>
                )}
            </div>
            <CardContent>
                {loading ? (
                    <ProjectsListSkeleton />
                ) : filteredProjects.length === 0 ? (
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <Folder className="size-6" />
                            </EmptyMedia>

                            <EmptyTitle>
                                {searchQuery ? "No projects found" : "No projects yet"}
                            </EmptyTitle>
                        </EmptyHeader>
                    </Empty>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredProjects.map((project) => (
                            <div
                                className="group flex flex-col justify-between gap-3 rounded-lg border bg-card p-4 transition-colors hover:border-primary hover:shadow-sm"
                                key={project.id}
                                onClick={() =>
                                    router.push(`/dashboard/projects/${project.id}`)
                                }
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="flex size-10 items-center justify-center rounded-lg"
                                            style={{ backgroundColor: `${project.colour}20` }}
                                        >
                                            <Folder
                                                className="size-5"
                                                style={{ color: project.colour }}
                                            />
                                        </div>
                                        <div className="flex min-w-0 flex-1 flex-col gap-2">
                                            <h3 className="wrap-break-word font-semibold text-base leading-tight">
                                                {project.name}
                                            </h3>
                                            {project.status && (
                                                <Badge className="w-fit text-xs" variant="outline">
                                                    {project.status}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <div onClick={(e) => e.stopPropagation()}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger aria-label={`More options for ${project.name}`}
                                                className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent transition-colors"
                                            >
                                                {actionLoading === project.id ? (
                                                    <Loader2 className="size-4 animate-spin" />
                                                ) : (
                                                    <MoreVertical className="size-4" />
                                                )}
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                                align="end"
                                                sideOffset={4}
                                            >
                                                <DropdownMenuItem onClick={() => handleSelect(project.id)}>
                                                    <FolderOpen className="size-4" />
                                                    Open
                                                </DropdownMenuItem>
                                                {onUpdateStatus && (
                                                    <>
                                                        <DropdownMenuItem onClick={() => onStatusChange(project.id, "active")}>
                                                            <Circle className="size-4" />
                                                            Mark as Active
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => onStatusChange(project.id, "archived")}
                                                        >
                                                            <Clock className="size-4" />
                                                            Mark as Achieved
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
                                                            onClick={() => {
                                                                handleDelete(project.id)
                                                            }}
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
                                {project.description && (
                                    <p className="wrap-break-word line-clamp-2 text-muted-foreground text-sm">
                                        {project.description}
                                    </p>
                                )}

                                <div className="flex items-center justify-between">
                                    <div className="flex -space-x-2">
                                        {project.members.slice(0, 3).map((member) => (
                                            <Avatar
                                                className="size-6 border-2 border-background"
                                                key={member.id}
                                            >
                                                <AvatarImage alt={member.fullName} src={member.avatar?.url} />
                                                <AvatarFallback className="text-xs">
                                                    {getInitials(member.fullName)}
                                                </AvatarFallback>
                                            </Avatar>
                                        ))}
                                        {project.members.length > 3 && (
                                            <div className="flex size-6 items-center justify-center rounded-full border-2 border-background bg-muted">
                                                <span className="text-muted-foreground text-xs">
                                                    +{project.members.length - 3}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </div>
    );
}


