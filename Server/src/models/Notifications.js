import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "task_created",
        "task_approved",
        "task_rejected",
        "task_completed",
        "welcome",
        "password_reset",
        "info",
        "warning",
        "error",
        "success"
      ],
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const Notification = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);
export default Notification;
