import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from "validator";
import { StatusCodes } from "http-status-codes";

const saltRounds = 10;
export const registerUser = async (req, res) => {
  try {
    let { email, fullname, password, confirmPassword, role, avatar } = req.body;

    email = email.trim().toLowerCase();
    if (!email || !fullname || !password || !confirmPassword || !role) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }
    //    if (role && !["admin", "user"].includes(role)) {
    //       return res.status(400).json({
    //         success: false,
    //         message: "Invalid role. Role must be either 'admin' or 'user'.",
    //       });
    //     }
    const isAlreadyRegistered = await User.findOne({
      $or: [{ fullname }, { email }],
    });

    if (isAlreadyRegistered) {
      return res
        .status(409)
        .json({ message: "Username or email already exists" });
    }
    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email format" });
    }
    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Passwords do not match" });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new User({
      email,
      fullname,
      password: hashedPassword,
      role,
      avatar,
    });
    await newUser.save();
    return res.status(StatusCodes.CREATED).json(
      {
        success: true, message: "User registered successfully",
        data: {
          userId: newUser._id,
          email: newUser.email,
          fullname: newUser.fullname,
          role: newUser.role,
        },
      },
    );
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal server error",
      errors: [{ field: "email" }],
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(statusCodes.UNAUTHORIZED)
        .json({ success: false, message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "5h" },
    );
    if (!token) {
      return res
        .status(500)
        .json({ success: false, message: "Token generation failed" });
    }
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 1000 * 60 * 60,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        userId: user._id,
        email: user.email,
        fullname: user.fullname,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const logoutUser = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });
  res.status(200).json({ success: true, message: "Logout successful" });
};

// export const refreshToken = async (req, res) => {
//   try {
//     const refreshToken = req.cookies.refreshToken;
//     if (!refreshToken) {
//       return res.status(401).json({ message: "Refresh token not found" });
//     }
//     const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
//     const newAccessToken = jwt.sign(
//       { id: decoded.id, role: decoded.role },
//       {
//         expiresIn: "1h",
//       },
//     );
//     return res.status(statusCodes.OK).json({
//       success: true,
//       message: "Access token refreshed successfully",
//       data: { accessToken: newAccessToken },
//     });
//   } catch (error) {
//     console.error("Error refreshing access token:", error);
//     return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({
//       success: false,
//       message: "Invalid Access token",
//     });
//   }
// };

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(statusCodes.NOT_FOUND).json({
        success: false,
        message: "User with this email does not exist",
      });
    }

    return res
      .status(200)
      .json({ success: true, message: "Password reset link sent to email" });
  } catch (error) {
    console.error(
      "Error occurred while processing forgot password request:",
      error,
    );
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
