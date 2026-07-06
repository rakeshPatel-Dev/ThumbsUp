import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    fullname: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["user", "admin"],
      default: "user",
    },
    avatar: {
      type: String,
    },
    isactive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);
const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
