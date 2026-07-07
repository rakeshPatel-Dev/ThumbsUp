import dotenv from "dotenv";

dotenv.config();
import app from "./app.js";

import connectDB from "./src/config/mongoose.config.js";

const port = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () => console.log(`Server is running on port ${port}`));
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1); // Exit the process with failure
  }
};
startServer();

// export default app;
