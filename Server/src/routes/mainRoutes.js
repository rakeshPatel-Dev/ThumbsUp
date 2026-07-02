import express from "express";
import userRoutes from "./userRoutes.js";
import taskRoutes from "./taskRoutes.js";

const router = express.Router();

router.use("/auth", userRoutes);
router.use("/tasks", taskRoutes);


export default router;
