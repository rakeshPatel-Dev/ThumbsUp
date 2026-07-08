import express from "express";
import {
  createTask,
  getTask,
  getTaskById,
  updateTask,
  deleteTask,
} from "../controller/task.controller.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = express.Router();

router.post("/", authenticateToken, createTask);
router.get("/", authenticateToken, getTask);
router.get("/:id", authenticateToken, getTaskById);
router.put("/:id", authenticateToken, updateTask);
router.delete("/:id", authenticateToken, deleteTask);

// Backward compatibility alias (if needed)
router.put("/updateTask/:id", authenticateToken, updateTask);

export default router;
