import { z } from 'zod';
import { ProjectStatus } from '../types/enums/project.enum.js';
declare const createProjectSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodString;
    dueDate: z.ZodString;
    colour: z.ZodString;
    members: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
declare const updateProjectSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    dueDate: z.ZodString;
    colour: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
declare const updateProjectStatus: z.ZodObject<{
    projectStatus: z.ZodEnum<typeof ProjectStatus>;
}, z.core.$strip>;
export { createProjectSchema, updateProjectSchema, updateProjectStatus };
//# sourceMappingURL=project.schema.d.ts.map