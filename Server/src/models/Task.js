import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
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
    enum: ["pending", "in progress", "completed"],
  },
  attachmentsUrl: {
    type: [String],
  },
  rejectionReason: {
    type: String,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  createat: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});
const Task = mongoose.model("Task", taskSchema);
export default Task;
