import User from "../models/User.js";
import PasswordResetToken from "../models/PasswordResetToken.js";
import EmailVerificationToken from "../models/EmailVerificationToken.js";
import { logActivity } from "../utils/activityLogger.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from "validator";
import { StatusCodes } from "http-status-codes";
import crypto from "crypto";
import {
  sendEmailVerificationEmail,
  sendRegistrationEmail,
  sendLoginNotificationEmail,
  sendForgotPasswordEmail,
  sendChangePasswordNotificationEmail,
} from "../services/email.service.js";

const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173"; // Default to localhost for development
const backendUrl = process.env.BACKEND_URL || "http://localhost:3000/api"; // Default to localhost for development
if (!frontendUrl) {
  console.error("FRONTEND_URL is not defined in environment variables.");
}
if (!backendUrl) {
  console.error("BACKEND_URL is not defined in environment variables.");
}

const saltRounds = 10;

// Password validation regex: min 8, max 30, at least 1 uppercase, 1 lowercase, 1 number, 1 special character
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,30}$/;

// POST /api/auth/register
export const registerUser = async (req, res) => {
  try {
    let { name, email, password, role = "employee", avatar } = req.body;

    if (!email || !name || !password) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        statusCode: StatusCodes.BAD_REQUEST,
        message: "Name, email, and password are required",
      });
    }

    email = email.trim().toLowerCase();
    name = name.trim();

    // Validation rules
    if (name.length < 2 || name.length > 50) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        statusCode: StatusCodes.BAD_REQUEST,
        message: "Name must be between 2 and 50 characters",
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        statusCode: StatusCodes.BAD_REQUEST,
        message: "Invalid email format",
      });
    }

    if (!PASSWORD_REGEX.test(password)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        statusCode: StatusCodes.BAD_REQUEST,
        message:
          "Password must be 8-30 characters, including at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character",
      });
    }

    if (role && !["employee", "manager", "admin"].includes(role)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        statusCode: StatusCodes.BAD_REQUEST,
        message: "Invalid role. Role must be employee, manager, or admin.",
      });
    }

    const isAlreadyRegistered = await User.findOne({ email });
    if (isAlreadyRegistered) {
      return res.status(StatusCodes.CONFLICT).json({
        success: false,
        statusCode: StatusCodes.CONFLICT,
        message: "Email already exists",
        errors: [
          {
            field: "email",
            message: "Email already exists",
          },
        ],
      });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new User({
      email,
      name,
      password: hashedPassword,
      role,
      avatar,
      isEmailVerified: false,
    });

    await newUser.save();

    // Create Email Verification Token
    const verificationTokenStr = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const verificationToken = new EmailVerificationToken({
      userId: newUser._id,
      token: verificationTokenStr,
      expiresAt,
    });
    await verificationToken.save();

    // Log the action
    await logActivity(
      newUser._id,
      "USER_REGISTER",
      "User",
      newUser._id.toString(),
      { email, name, role },
      req,
    );

    const verificationLink = `${backendUrl}/auth/verify-email?token=${verificationTokenStr}`;

    // Send verification email
    await sendEmailVerificationEmail(email, verificationLink).catch((error) => {
      console.error(`Error sending verification email to ${email}:`, error);
    });

    await sendRegistrationEmail(email, name).catch((error) => {
      console.error(`Error sending registration email to ${email}:`, error);
    });

    return res.status(StatusCodes.CREATED).json({
      success: true,
      statusCode: StatusCodes.CREATED,
      message: "User registered successfully. Please verify your email.",
      data: {
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      },
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Internal server error",
    });
  }
};

// POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        statusCode: StatusCodes.BAD_REQUEST,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        statusCode: StatusCodes.UNAUTHORIZED,
        message: "Invalid credentials",
      });
    }

    // Check suspension
    if (!user.isActive) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        statusCode: StatusCodes.FORBIDDEN,
        message: "Account suspended",
      });
    }

    // Check email verification
    if (!user.isEmailVerified) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        statusCode: StatusCodes.FORBIDDEN,
        message: "Email not verified",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        statusCode: StatusCodes.UNAUTHORIZED,
        message: "Invalid credentials",
      });
    }

    // Generate accessToken
    const accessToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "5h" },
    );

    // Generate refreshToken
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET, // using same secret or custom, we will use process.env.JWT_SECRET
      { expiresIn: "7d" },
    );

    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    // Set cookie
    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 5 * 60 * 60 * 1000, // 5 hours to match token expiry
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    await logActivity(
      user._id,
      "USER_LOGIN",
      "User",
      user._id.toString(),
      {},
      req,
    );
    const deviceInfo = req.headers["user-agent"] || "Unknown device";
    await sendLoginNotificationEmail(user.email, user.name, deviceInfo).catch(
      (error) => {
        console.error(
          `Error sending login notification email to ${user.email}:`,
          error,
        );
      },
    );
    return res.status(StatusCodes.OK).json({
      success: true,
      statusCode: StatusCodes.OK,
      message: "Login successful",
      data: {
        accessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
        },
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Internal server error",
    });
  }
};

// POST /api/auth/logout
export const logoutUser = async (req, res) => {
  try {
    if (req.user) {
      // Clear refresh token in database
      await User.findByIdAndUpdate(req.user.id, { refreshToken: null });
      await logActivity(
        req.user.id,
        "USER_LOGOUT",
        "User",
        req.user.id,
        {},
        req,
      );
    }

    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      statusCode: StatusCodes.OK,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Internal server error",
    });
  }
};

// POST /api/auth/refresh-token
export const refreshToken = async (req, res) => {
  try {
    const rToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!rToken) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        statusCode: StatusCodes.UNAUTHORIZED,
        message: "Refresh token not found",
      });
    }

    const decoded = jwt.verify(rToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== rToken || !user.isActive) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        statusCode: StatusCodes.FORBIDDEN,
        message: "Invalid or inactive refresh token",
      });
    }

    const newAccessToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "5h" },
    );

    // Set cookie
    res.cookie("token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 5 * 60 * 60 * 1000,
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      statusCode: StatusCodes.OK,
      message: "Token refreshed",
      data: {
        accessToken: newAccessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
        },
      },
    });
  } catch (error) {
    console.error("Refresh Token Error:", error);
    return res.status(StatusCodes.FORBIDDEN).json({
      success: false,
      statusCode: StatusCodes.FORBIDDEN,
      message: "Invalid refresh token",
    });
  }
};

// POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        statusCode: StatusCodes.BAD_REQUEST,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Return 200 even if user doesn't exist for security reasons, as per specification or just do it standard
      return res.status(StatusCodes.OK).json({
        success: true,
        statusCode: StatusCodes.OK,
        message: "Password reset email sent",
      });
    }

    // Generate Password Reset Token of 6 characters
    const resetTokenStr = crypto.randomBytes(3).toString("hex");
    // Set token expiry to 10 minutes
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Mark previous tokens as used
    await PasswordResetToken.updateMany(
      { userId: user._id, used: false },
      { used: true },
    );

    const passwordReset = new PasswordResetToken({
      userId: user._id,
      token: resetTokenStr,
      expiresAt,
    });
    await passwordReset.save();

    await logActivity(
      user._id,
      "FORGOT_PASSWORD_REQUEST",
      "User",
      user._id.toString(),
      { email },
      req,
    );

    await sendForgotPasswordEmail(email, resetTokenStr).catch((error) => {
      console.error(`Error sending password reset email to ${email}:`, error);
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      statusCode: StatusCodes.OK,
      message: "Password reset email sent",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Internal server error",
    });
  }
};

// POST /api/auth/reset-password
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        statusCode: StatusCodes.BAD_REQUEST,
        message: "Token and new password are required",
      });
    }

    if (!PASSWORD_REGEX.test(newPassword)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        statusCode: StatusCodes.BAD_REQUEST,
        message:
          "Password must be 8-30 characters, including at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character",
      });
    }

    const resetTokenDoc = await PasswordResetToken.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!resetTokenDoc) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        statusCode: StatusCodes.BAD_REQUEST,
        message: "Invalid or expired password reset token",
      });
    }

    const user = await User.findById(resetTokenDoc.userId);
    if (!user || !user.isActive) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        statusCode: StatusCodes.BAD_REQUEST,
        message: "User account is inactive or not found",
      });
    }

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    user.password = hashedPassword;
    user.refreshToken = null; // force relogin
    await user.save();

    // Mark token as used
    resetTokenDoc.used = true;
    await resetTokenDoc.save();

    await logActivity(
      user._id,
      "PASSWORD_RESET_SUCCESS",
      "User",
      user._id.toString(),
      {},
      req,
    );

    // Send notification email about password change
    await sendChangePasswordNotificationEmail(user.email, user.name).catch((error) => {
      console.error(`Error sending password change notification email to ${user.email}:`, error);
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      statusCode: StatusCodes.OK,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Internal server error",
    });
  }
};

// POST /api/auth/verify-email
export const verifyEmail = async (req, res) => {
  try {
    // the token can be sent in the query params or in the body
    const token = req.query.token || req.body.token;
    if (!token) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        statusCode: StatusCodes.BAD_REQUEST,
        message: "Token is required",
      });
    }

    const verificationTokenDoc = await EmailVerificationToken.findOne({
      token,
      verified: false,
      expiresAt: { $gt: new Date() },
    });

    if (!verificationTokenDoc) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        statusCode: StatusCodes.BAD_REQUEST,
        message: "Invalid or expired verification token",
      });
    }

    const user = await User.findById(verificationTokenDoc.userId);
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        statusCode: StatusCodes.NOT_FOUND,
        message: "User not found",
      });
    }

    user.isEmailVerified = true;
    await user.save();

    verificationTokenDoc.verified = true;
    await verificationTokenDoc.save();

    await logActivity(
      user._id,
      "EMAIL_VERIFIED",
      "User",
      user._id.toString(),
      {},
      req,
    );

    // Delete all email verification tokens for the user
    await EmailVerificationToken.deleteMany({ userId: user._id });

    // redirect to a success page of the frontend application
    res.redirect(`${frontendUrl}/email-verified-success`); // Adjust the URL as needed

    return res.status(StatusCodes.OK).json({
      success: true,
      statusCode: StatusCodes.OK,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("Verify Email Error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Internal server error",
    });
  }
};

// POST /api/auth/change-password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        statusCode: StatusCodes.BAD_REQUEST,
        message: "Current password and new password are required",
      });
    }

    if (!PASSWORD_REGEX.test(newPassword)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        statusCode: StatusCodes.BAD_REQUEST,
        message:
          "New password must be 8-30 characters, including at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        statusCode: StatusCodes.NOT_FOUND,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        statusCode: StatusCodes.UNAUTHORIZED,
        message: "Invalid current password",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    user.password = hashedPassword;
    user.refreshToken = null; // revoke refresh token
    await user.save();

    await logActivity(
      user._id,
      "PASSWORD_CHANGE",
      "User",
      user._id.toString(),
      {},
      req,
    );

    return res.status(StatusCodes.OK).json({
      success: true,
      statusCode: StatusCodes.OK,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change Password Error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Internal server error",
    });
  }
};
