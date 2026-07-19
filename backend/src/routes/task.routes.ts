import { Router } from "express";
import { createTask
    ,updateTaskDetails
    ,deleteTaskById
    ,getAllProjectTasks, 
    getAllTasks,
    changeTaskStatus,
    getTaskById
} from "../controllers/task.controller.js";
import { createTaskSchema, updateTaskSchema,updateTaskStatus } from "../Schemas/task.schema.js";
import { validate } from "../Schemas/validate.js";
import { verifyJwt } from "../middleware/auth.middleware.js";

const router=Router()

router.route('/create').post(verifyJwt,validate(createTaskSchema),createTask)
router.route('/:taskId').patch(verifyJwt,validate(updateTaskSchema),updateTaskDetails)
router.route('/s/:taskId').patch(verifyJwt,validate(updateTaskStatus),changeTaskStatus)
router.route('/:taskId').delete(verifyJwt,deleteTaskById)
router.route('/:taskId').get(verifyJwt,getTaskById)
router.route('/project/:projectId').get(verifyJwt,getAllProjectTasks)
router.route('/').get(verifyJwt,getAllTasks)

export default router
