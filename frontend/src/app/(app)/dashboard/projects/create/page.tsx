"use client"
import {
    Calendar,
    CheckCircle2,
    Circle,
    CircleX,
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
import { useCallback, useEffect, useMemo, useState } from "react";
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
    CardFooter
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
import { Field, FieldContent, FieldError, FieldLabel, FieldTitle, FieldDescription } from "@/components/ui/field";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTaskSchema } from "@/Schemas/task.schema";
import * as  z from "zod";
import { Controller, useForm } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { TaskPriorityEnum, TaskStatusEnum } from "@/types/enums/task.enum";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Skeleton } from "boneyard-js/react"
import { TaskAssignee } from "@/types/task.type";
import { availableProjects } from "@/types/enums/project.enum";
import api from "@/lib/axios";
import { toast } from "sonner";
import { useAppSelector } from "@/store/hook";
import { availableAssignees } from "@/types/enums/user.enum";
import ApiResponse from "@/types/ApiResponse";
import { AxiosError } from "axios";
import { createProjectSchema } from "@/Schemas/project.schema";
import { CreateProjectSkeleton } from "@/components/skeletons/create-project-skeleton";


type CreateProjectData = {
    name: string;
    description?: string;
    dueDate?: string;
    members: string[];
    colour?: string;
};

export interface availableMembers {
    id: string,
    fullName: string
}




function CreateProject() {

    const [isCreating, setIsCreating] = useState(false);
    const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [availableMembers, setAvailableMembers] = useState<availableMembers[]>([]);
    const user = useAppSelector((state) => state.auth.user);
    const router = useRouter()



    useEffect(() => {
        if (!user || !user.id) {
            return;
        }

        const fetchMembers = async () => {
            setIsLoading(true)
            try {
                const response = await api.get("/get-users");

                setAvailableMembers(response.data.data);
            } catch (error) {
                const axiosError = error as AxiosError<ApiResponse<unknown>>;
                const errorMessage = axiosError.response?.data?.message;
                toast.error("Failed to fetch available members",
                    { description: errorMessage });
            } finally {
                setIsLoading(false)
            }
        };

        fetchMembers();
    }, [user]);



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


    const createProject = useCallback(
        async (data: CreateProjectData): Promise<void> => {
            try {
                const response = await api.post("/api/projects/create", data)
                toast.message(response.data.message);
                router.push("/dashboard/projects");
            } catch (error) {
                 const axiosError = error as AxiosError<ApiResponse<unknown>>;
                const errorMessage = axiosError.response?.data?.message;
                 toast.error("Failed to created the project",
                    { description: errorMessage });
            }
        }, [])

    const onSubmit = async (data: z.infer<typeof createProjectSchema>) => {
        setIsCreating(true);

        try {
            await createProject(data);
            form.reset();
        } finally {
            setIsCreating(false);
        }
    };

    if (isLoading) {
        return (
            <CreateProjectSkeleton />
        )
    }



    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
            <div>
                <h1 className="text-xl font-semibold sm:text-2xl">
                    Create Project
                </h1>
                <p className="text-sm text-muted-foreground">
                    Create a new team project workspace
                </p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="flex flex-col gap-4">
                    <Controller
                        name="name"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="title">Name</FieldLabel>
                                <Input
                                    {...field}
                                    id="title"
                                    aria-invalid={fieldState.invalid}
                                    placeholder="Project name..."
                                    autoComplete="off"
                                />
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />

                    <Controller
                        name="description"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="description">Description</FieldLabel>
                                <Textarea
                                    {...field}
                                    id="description"
                                    aria-invalid={fieldState.invalid}
                                    placeholder="What is this project about?"
                                    autoComplete="off"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Tip: supports Markdown — use **bold**, ### headings, and * for bullet points.
                                </p>
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />

                    <Controller
                        name="dueDate"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="dueDate">Due Date</FieldLabel>
                                <FieldContent>
                                    <InputGroup>
                                        <InputGroupAddon>
                                            <Calendar className="size-4" />
                                        </InputGroupAddon>
                                        <InputGroupInput
                                            {...field}
                                            id="dueDate"
                                            type="date"
                                            value={field.value ?? ""}
                                            onChange={(e) => field.onChange(e.target.value)}
                                            aria-invalid={fieldState.invalid}
                                        />
                                    </InputGroup>
                                </FieldContent>
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />

                    <Controller
                        name="members"
                        control={form.control}
                        render={({ field }) => (
                            <Field>
                                <FieldLabel>Select members</FieldLabel>
                                <FieldContent>
                                    <div className="flex flex-wrap gap-2">
                                        {availableMembers?.map((member) => {
                                            const isSelected = field.value.includes(member.id);
                                            return (
                                                <Button
                                                    key={member.id}
                                                    type="button"
                                                    size="sm"
                                                    variant={isSelected ? "default" : "outline"}
                                                    onClick={() => {
                                                        const updated = isSelected
                                                            ? field.value.filter((id: string) => id !== member.id)
                                                            : [...field.value, member.id];
                                                        field.onChange(updated);
                                                    }}
                                                >
                                                    {member.fullName}
                                                </Button>
                                            );
                                        })}
                                    </div>
                                </FieldContent>
                            </Field>
                        )}
                    />
                    <Controller
                        name="colour"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="project-color">Colour</FieldLabel>

                                <FieldContent>
                                    <div className="flex items-center gap-3">
                                        <input
                                            {...field}
                                            id="project-color"
                                            type="color"
                                            className="size-10 rounded border"
                                            value={field.value ?? "#3b82f6"}
                                            onChange={(e) => field.onChange(e.target.value)}
                                            aria-invalid={fieldState.invalid}
                                        />

                                        <InputGroup className="flex-1">
                                            <InputGroupInput
                                                value={field.value}
                                                type="text"
                                                placeholder="#3b82f6"
                                                onChange={(e) => field.onChange(e.target.value)}
                                                aria-invalid={fieldState.invalid}
                                            />
                                        </InputGroup>
                                    </div>
                                </FieldContent>

                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />
                </div>

                <div className="flex justify-end gap-2 mt-6">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" aria-busy={isCreating} data-loading={isCreating}>
                        {isCreating ? (
                            <>
                                <Loader2 className="size-4 animate-spin" />
                                Creating…
                            </>
                        ) : (
                            "Create Project"
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}

export default CreateProject
