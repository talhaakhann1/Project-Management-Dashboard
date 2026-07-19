import { z } from 'zod';
export const signInSchema = z.object({
    email: z.string(),
    password: z.string(),
    rememberMe: z.boolean().optional()
});
//# sourceMappingURL=signInSchema.js.map