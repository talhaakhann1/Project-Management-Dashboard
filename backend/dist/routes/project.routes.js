import { Router } from "express";
import { createProject, updatedProjectDetails, deleteProjectById, getAllProjects, getProjectById, getAllAvailableProjects, changeProjectStatus } from "../controllers/project.controller.js";
import { createProjectSchema, updateProjectSchema, updateProjectStatus } from "../Schemas/project.schema.js";
import { validate } from "../Schemas/validate.js";
import { verifyJwt } from "../middleware/auth.middleware.js";
const router = Router();
router.route('/create').post(verifyJwt, validate(createProjectSchema), createProject);
router.route('/:projectId').patch(verifyJwt, validate(updateProjectSchema), updatedProjectDetails);
router.route('/s/:projectId').patch(verifyJwt, validate(updateProjectStatus), changeProjectStatus);
router.route('/:projectId').delete(verifyJwt, deleteProjectById);
router.route('/').get(verifyJwt, getAllProjects);
router.route('/all').get(verifyJwt, getAllAvailableProjects);
router.route('/:projectId').get(verifyJwt, getProjectById);
export default router;
//# sourceMappingURL=project.routes.js.map