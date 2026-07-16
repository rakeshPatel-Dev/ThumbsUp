import express from "express";
import {
  Profile,
  updateProfile,
  getAllUsers,
  updateUserRole,
  suspendUser,
  deleteAccount,
} from "../controller/user.controller.js";
import { authenticateToken } from "../middlewares/auth.js";
import authorizeRoles from "../middlewares/role.middleware.js";

const router = express.Router();

// Profile endpoints
router.get("/profile", authenticateToken, Profile);
router.put("/profile", authenticateToken, updateProfile);

// Admin-only user management endpoints
router.get("/", authenticateToken, authorizeRoles("admin"), getAllUsers);
router.put("/:userId/role", authenticateToken, authorizeRoles("admin"), updateUserRole);
router.put("/:userId/suspend", authenticateToken, authorizeRoles("admin"), suspendUser);

// Self-service account deletion
router.delete("/account", authenticateToken, deleteAccount);

export default router;
