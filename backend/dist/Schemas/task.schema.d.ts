import { z } from "zod";
import { TaskPriorityEnum, TaskStatusEnum } from "../types/enums/task.enum.js";
declare const createTaskSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
    dueDate: z.ZodCoercedDate<unknown>;
    projectId: z.ZodString;
    priority: z.ZodEnum<typeof TaskPriorityEnum>;
    assignees: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
declare const updateTaskSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    dueDate: z.ZodCoercedDate<unknown>;
    priority: z.ZodOptional<z.ZodEnum<typeof TaskPriorityEnum>>;
}, z.core.$strip>;
declare const updateTaskStatus: z.ZodObject<{
    taskStatus: z.ZodEnum<typeof TaskStatusEnum>;
}, z.core.$strip>;
export { createTaskSchema, updateTaskSchema, updateTaskStatus };
//# sourceMappingURL=task.schema.d.ts.map