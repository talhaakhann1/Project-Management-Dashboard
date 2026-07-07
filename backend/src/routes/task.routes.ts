import { Router } from "express";
import { createTask
    ,updateTaskDetails
    ,deleteTask
    ,getAllProjectTasks } from "../controllers/task.controller.js";
import { createTaskSchema, updateTaskSchema } from "../Schemas/task.schema.js";
import { validate } from "../Schemas/validate.js";
import { verifyJwt } from "../middleware/auth.middleware.js";

const router=Router()

router.route('/create/:projectId').post(verifyJwt,validate(createTaskSchema),createTask)
router.route('/:taskId').patch(verifyJwt,validate(updateTaskSchema),updateTaskDetails)
router.route('/:taskId').delete(verifyJwt,deleteTask)
router.route('/:projectId').get(verifyJwt,getAllProjectTasks)

export default router
