import { z } from "zod";
import { TaskPriorityEnum, TaskStatusEnum } from "../types/enums/task.enum.js";

 const createTaskSchema = z.object({
  title: z
    .string()
    .min(4, "name must be at least 4 characters.")
    .max(16, "name must be at least 16 characters."),
  description: z
    .string()
    .min(8, "name must be at least 8 characters.")
    .max(300, "name must be at least 300 characters."),
  dueDate: z.coerce.date(), //send data as string
  status: z.enum(TaskStatusEnum),
  priority: z.enum(TaskPriorityEnum),
  assignees: z.array(z.string()),
  tags: z.array(z.string()),
});

 const updateTaskSchema = z.object({
  title: z
    .string()
    .min(4, "name must be at least 4 characters.")
    .max(16, "name must be at least 16 characters.")
    .optional(),
  description: z
    .string()
    .min(8, "name must be at least 8 characters.")
    .max(300, "name must be at least 300 characters.")
    .optional(),
  dueDate: z.coerce.date(),
  status: z.enum(TaskStatusEnum).optional(),
  priority: z.enum(TaskPriorityEnum).optional(),
});

export { createTaskSchema, updateTaskSchema };
