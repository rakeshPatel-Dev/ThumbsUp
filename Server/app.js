import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import mainRoutes from "./src/routes/mainRoutes.js";

const app = express();
const port = process.env.Port || 3000;
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.json());
app.use("/api", mainRoutes);

export default app;
