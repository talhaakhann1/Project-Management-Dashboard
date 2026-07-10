import {z} from 'zod'
import { AvailableProjectColour } from '../types/enums/project.enum.js'

 const createProjectSchema=z.object({
    name:z.string()
    .min(4,'name must be at least 4 characters.')
    .max(32,'name must be at least 32 characters.'),
    description:z.string()
    .min(8,'name must be at least 8 characters.')
    .max(300,'name must be at least 300 characters.'),
    colour:z.enum(AvailableProjectColour),
    members: z.array(z.string())
})

 const updateProjectSchema = z.object({
  name: z
    .string()
    .min(4, "name must be at least 4 characters.")
    .max(16, "name must be at least 16 characters.")
    .optional(),
  description: z
    .string()
    .min(8, "name must be at least 8 characters.")
    .max(300, "name must be at least 300 characters.")
    .optional(),
    colour: z.enum(AvailableProjectColour).optional()
  });

export {createProjectSchema,updateProjectSchema}