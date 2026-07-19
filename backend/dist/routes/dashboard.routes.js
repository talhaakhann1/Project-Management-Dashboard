import { Router } from "express";
import { getDashboardStats, getTodayTasks, getWelcomeSummary, getAllProjects, } from "../controllers/dashboard.controller.js";
import { verifyJwt } from "../middleware/auth.middleware.js";
const router = Router();
router.route("/stats").get(verifyJwt, getDashboardStats);
router.route("/today-tasks").get(verifyJwt, getTodayTasks);
router.route("/welcome-summary").get(verifyJwt, getWelcomeSummary);
router.route("/projects").get(verifyJwt, getAllProjects);
export default router;
//# sourceMappingURL=dashboard.routes.js.map