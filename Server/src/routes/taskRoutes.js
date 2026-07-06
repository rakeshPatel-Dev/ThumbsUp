import express from "express";
import {
  createTask,
  getTask,
  deleteTask,
  getTaskById,
  updateTask,
} from "../controller/taskController.js";
import { authenticateToken } from "../middlewares/auth.js";
import authorizeRoles from "../middlewares/role.middleware.js";

const router = express.Router();
router.delete("/:id", authenticateToken, authorizeRoles("admin"), deleteTask);

router.post("/", authenticateToken, createTask);

router.get("/", authenticateToken, authorizeRoles("admin"), getTask);
router.get("/:id", authenticateToken, getTaskById);
router.put("/updateTask/:id", authenticateToken, updateTask);
export default router;
