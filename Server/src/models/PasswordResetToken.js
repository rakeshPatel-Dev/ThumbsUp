import mongoose from "mongoose";

const passwordResetTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
    used: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true }
);

const PasswordResetToken = mongoose.models.PasswordResetToken || mongoose.model("PasswordResetToken", passwordResetTokenSchema);
export default PasswordResetToken;
