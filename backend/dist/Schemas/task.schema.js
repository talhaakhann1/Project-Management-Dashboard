import { z } from "zod";
import { TaskPriorityEnum, TaskStatusEnum } from "../types/enums/task.enum.js";
const createTaskSchema = z.object({
    title: z
        .string()
        .min(4, "name must be at least 4 characters.")
        .max(100, "name must be at least 100 characters."),
    description: z
        .string()
        .min(10, "name must be at least 10 characters.")
        .max(10000, "name must be at least 300 characters."),
    dueDate: z.coerce.date(),
    projectId: z.string(),
    priority: z.enum(TaskPriorityEnum),
    assignees: z.array(z.string()),
});
const updateTaskSchema = z.object({
    title: z
        .string()
        .min(4, "name must be at least 4 characters.")
        .max(100, "name must be at least 100 characters.")
        .optional(),
    description: z
        .string()
        .min(10, "name must be at least 10 characters.")
        .max(10000, "name must be at least 10000 characters.")
        .optional(),
    dueDate: z.coerce.date(),
    priority: z.enum(TaskPriorityEnum).optional(),
});
const updateTaskStatus = z.object({
    taskStatus: z.enum(TaskStatusEnum)
});
export { createTaskSchema, updateTaskSchema, updateTaskStatus };
//# sourceMappingURL=task.schema.js.map