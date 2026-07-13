import { Router } from "express";
import {
  getDashboardStats,
  getTodayTasks,
  getWelcomeSummary,
} from "../controllers/dashboard.controller.js";

const router = Router();

router.get("/stats", getDashboardStats);
router.get("/today-tasks", getTodayTasks);
router.get("/welcome-summary", getWelcomeSummary);

export default router;