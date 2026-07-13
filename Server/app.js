import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import dotenv from "dotenv";
dotenv.config();
import mainRoutes from "./src/routes/main.routes.js";
import { requestLogger } from "./src/middlewares/logger.middleware.js";
import { StatusCodes } from "http-status-codes";
import connectDB from "./src/config/mongoose.config.js";

const app = express();

// Lazy DB connection for serverless environments (Vercel)
app.use(async (req, res, next) => {
  if (!global.mongoose?.conn) {
    try {
      await connectDB();
    } catch (err) {
      console.error("DB connection failed:", err.message);
    }
  }
  next();
});

app.use(cors({
  origin: true, // Allow all origins for development, or specify your origin
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Request logger middleware
app.use(requestLogger);

// Main routes
app.use("/api", mainRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Global Error Handler caught:", err);
  const statusCode = err.status || StatusCodes.INTERNAL_SERVER_ERROR;
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message: err.message || "Internal Server Error",
  });
});

export default app;
