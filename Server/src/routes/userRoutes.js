import express from "express";
import mongoose from "mongoose";
import {
  registerUser,
  loginUser,
  logoutUser,
} from "../controller/auth.controller.js";
import { authenticateToken } from "../middlewares/auth.js";
import { Profile } from "../controller/user.conroller.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", authenticateToken, Profile);

router.post("/logout", authenticateToken, logoutUser);

export default router;
