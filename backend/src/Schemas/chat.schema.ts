import { z } from "zod";

const createAGroupChatSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Group name is required"),

  participants: z
    .array(z.string())
    .min(2, "Participants must have at least 2 members")
    .max(100, "Participants cannot exceed 100 members"),
});

const updateGroupChatNameSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Group name is required"),
});

export {
  createAGroupChatSchema,
  updateGroupChatNameSchema,
};