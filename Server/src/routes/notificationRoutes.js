import express from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../controller/notification.controller.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = express.Router();

router.use(authenticateToken);

router.get("/", getNotifications);
router.put("/read-all", markAllAsRead);
router.put("/:notificationId/read", markAsRead);
router.delete("/:notificationId", deleteNotification);

export default router;