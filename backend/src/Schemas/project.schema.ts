import {z} from 'zod'
import { ProjectStatus } from '../types/enums/project.enum.js';

 const createProjectSchema=z.object({
    name:z.string()
    .min(4,'name must be at least 4 characters.')
    .max(100,'name must be at least 100 characters.'),
    description:z.string()
    .min(8,'name must be at least 8 characters.')
    .max(10000,'name must be at least 10000 characters.'),
    dueDate:z.string(),
    colour:z.string(),
    members: z.array(z.string())
})

 const updateProjectSchema = z.object({
  name: z
    .string()
    .min(4, "name must be at least 4 characters.")
    .max(100, "name must be at least 100 characters.")
    .optional(),
  description: z
    .string()
    .min(10, "name must be at least 10 characters.")
    .max(10000, "name must be at least 10000 characters.")
    .optional(),
    dueDate:z.string(),
    colour: z.string().optional()
  });

  const updateProjectStatus=z.object({
    projectStatus:z.enum(ProjectStatus)
  })

export {createProjectSchema,updateProjectSchema,updateProjectStatus}