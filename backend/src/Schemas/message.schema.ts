import { z } from "zod";

const sendMessageSchema = z.object({
  content: z
    .string()
    .trim()
    .optional()
    .refine((value) => value === undefined || value.length > 0, {
      message: "Content is required",
    }),
});

export { sendMessageSchema };