"use client"
import {
    Calendar,
    Loader2
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
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
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTaskSchema } from "@/Schemas/task.schema";
import * as  z from "zod";
import { Controller, useForm } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { TaskPriorityEnum, TaskStatusEnum } from "@/types/enums/task.enum";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { availableProjects } from "@/types/enums/project.enum";
import api from "@/lib/axios";
import { toast } from "sonner";
import { useAppSelector } from "@/store/hook";
import { availableAssignees } from "@/types/enums/user.enum";
import ApiResponse from "@/types/ApiResponse";
import { AxiosError } from "axios";
import { CreateTaskSkeleton } from "@/components/skeletons/create-task-skeleton";



export interface CreateTask {
    title: string;
    description: string;
    priority: TaskPriorityEnum;
    assignees?: string[];
    dueDate?: string;
    projectId?: string;
}



function CreateTask() {

    const [isCreating, setIsCreating] = useState(false);
    const [availableAssignees, setAvailableAssignees] = useState<availableAssignees[]>([])
    const [availableProjects, setAvailableProjects] = useState<availableProjects[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const user = useAppSelector((state) => state.auth.user);
    const router = useRouter()

    useEffect(() => {
        if (!user || !user.id) {
            return;
        }
    })

    const fetchAssignees = async () => {
        setIsLoading(true)
        try {
            const response = await api.get("/get-users");

            setAvailableAssignees(response.data.data);
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse<unknown>>;
            const errorMessage = axiosError.response?.data?.message;
            toast("Failed to fetch the assignees", { description: errorMessage });
        } finally {
            setIsLoading(false)
        }
    };

    const fetchAllAvailableProjects = async () => {
        setIsLoading(true)
        try {
            const response = await api.get("/api/projects/all");
            setAvailableProjects(response.data.data);
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse<unknown>>;
            const errorMessage = axiosError.response?.data?.message;
            toast.error("Failed to fetch all available project", { description: errorMessage });
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchAllAvailableProjects()
        fetchAssignees()
    }, [user])


    const form = useForm<z.infer<typeof createTaskSchema>>({
        resolver: zodResolver(createTaskSchema),
        defaultValues: {
            title: "",
            description: "",
            priority: TaskPriorityEnum.MEDUIM,
            projectId: "",
            assignees: [],
            dueDate: "",
        }
    })

    const createTask = useCallback(
        async (data: CreateTask): Promise<void> => {
            try {
                const response = await api.post("/api/tasks/create", data)
                toast.message(response.data.message);
                router.push("/dashboard/tasks");
            } catch (error) {
                const axiosError = error as AxiosError<ApiResponse<unknown>>;
                const errorMessage = axiosError.response?.data?.message;
                toast("Failed to create the task", { description: errorMessage });
            }
        }, [])


    const onSubmit = async (data: z.infer<typeof createTaskSchema>) => {
        setIsCreating(true);
        console.log("Data", data);

        try {
            await createTask(data);
            form.reset();
        } finally {
            setIsCreating(false);
        }
    }

    if (isLoading) {
        return (
            <CreateTaskSkeleton />
        )
    }

    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
            <div>
                <h1 className="text-xl font-semibold sm:text-2xl">
                    Create Task
                </h1>
                <p className="text-sm text-muted-foreground">
                    Add a new task and assign it to your team
                </p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="flex flex-col gap-4">
                    <Controller
                        name="title"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="title">Title</FieldLabel>
                                <Input
                                    {...field}
                                    id="title"
                                    aria-invalid={fieldState.invalid}
                                    placeholder="Task name..."
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
                                    placeholder="What needs to be done?"
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
                        name="priority"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="priority">Priority</FieldLabel>
                                <FieldContent>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger id="priority" aria-invalid={fieldState.invalid}>
                                            <SelectValue placeholder="Select priority" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={TaskPriorityEnum.LOW}>Low</SelectItem>
                                            <SelectItem value={TaskPriorityEnum.MEDUIM}>Medium</SelectItem>
                                            <SelectItem value={TaskPriorityEnum.HIGH}>High</SelectItem>
                                            <SelectItem value={TaskPriorityEnum.URGENT}>Urgent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FieldContent>
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

                    {availableProjects.length > 0 && (
                        <Controller
                            name="projectId"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="project">Project</FieldLabel>
                                    <FieldContent>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger id="project" aria-invalid={fieldState.invalid}>
                                                <SelectValue placeholder="Select project">
                                                    {availableProjects.find((p) => p.id === field.value)?.name ??
                                                        "Select project"}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableProjects.map((project) => (
                                                    <SelectItem key={project.id} value={project.id}>
                                                        {project.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FieldContent>
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                    )}

                    <Controller
                        name="assignees"
                        control={form.control}
                        render={({ field }) => (
                            <Field>
                                <FieldLabel>Select assignees</FieldLabel>
                                <FieldContent>
                                    <div className="flex flex-wrap gap-2">
                                        {availableAssignees?.map((assignee) => {
                                            const isSelected = field.value.includes(assignee.id);
                                            return (
                                                <Button
                                                    key={assignee.id}
                                                    type="button"
                                                    size="sm"
                                                    variant={isSelected ? "default" : "outline"}
                                                    onClick={() => {
                                                        const updated = isSelected
                                                            ? field.value.filter((id: string) => id !== assignee.id)
                                                            : [...field.value, assignee.id];
                                                        field.onChange(updated);
                                                    }}
                                                >
                                                    {assignee.fullName}
                                                </Button>
                                            );
                                        })}
                                    </div>
                                </FieldContent>
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
                            "Create Task"
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}

export default CreateTask
