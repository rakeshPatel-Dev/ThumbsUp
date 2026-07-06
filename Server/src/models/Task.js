import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
    },
    deadline: {
      type: Date,
    },
    category: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "approved"],
    },

    rejectionReason: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  }, 
  { timestamps: true },
);
const Task = mongoose.model("Task", taskSchema);
export default Task;
