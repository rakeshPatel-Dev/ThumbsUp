import express from "express";
import {
  getDashboardStats,
  getSystemLogs,
} from "../controller/admin.controller.js";
import { authenticateToken } from "../middlewares/auth.js";
import authorizeRoles from "../middlewares/role.middleware.js";

const router = express.Router();

router.use(authenticateToken, authorizeRoles("admin"));

router.get("/dashboard", getDashboardStats);
router.get("/logs", getSystemLogs);

export default router;
