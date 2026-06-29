import express from "express";
import mainRoutes from "./src/routes/mainRoutes.js";
import dotenv from "dotenv";

import connectDB from "./src/config/mongoose.config.js";

const app = express();
const port = process.env.Port || 3000;

dotenv.config();
connectDB();
app.use(express.json());
app.use("/api", mainRoutes);
app.listen(port, () => console.log(`Server is running on port ${port}`));
