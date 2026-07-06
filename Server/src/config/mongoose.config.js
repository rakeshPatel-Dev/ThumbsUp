import mongoose from "mongoose";

// Cache connection for serverless/hot-reload environments
let cached = global.mongoose || { conn: null, promise: null };
global.mongoose = cached;

const connectDB = async () => {
  // Return existing connection if available
  if (cached.conn) {
    console.log("📦 Using cached database connection");
    return cached.conn;
  }

  try {
    // Start connection only if one isn't already in progress
    if (!cached.promise) {
      cached.promise = mongoose.connect(process.env.MONGOOSE_URI);
    }

    cached.conn = await cached.promise;
    console.log("✅ MongoDB connected successfully");
    return cached.conn;
  } catch (error) {
    cached.promise = null; // reset so next call can retry
    console.error("❌ Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
};

// Clear cache if MongoDB drops the connection
mongoose.connection.on("disconnected", () => {
  console.log("⚠️ MongoDB disconnected");
  cached.conn = null;
  cached.promise = null;
});

export default connectDB;
