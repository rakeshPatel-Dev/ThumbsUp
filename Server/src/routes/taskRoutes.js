import express from "express";
import {
  createTask,
  getTask,
  deleteTask,
  getTaskById,
} from "../controller/taskController.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = express.Router();
router.post("/createTask", authenticateToken, createTask);
router.get("/getTask", authenticateToken, getTask);
router.get("/getTaskByID/:id", authenticateToken, getTaskById);
router.delete("deleteTask/:id", authenticateToken, deleteTask);
export default router;
