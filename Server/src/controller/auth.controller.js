import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from "validator";

const saltRounds = 10;
export const registerUser = async (req, res) => {
  try {
    const { email, fullname, password, confirmPassword, role, avatar } =
      req.body;

    email = email.trim().toLowerCase();
    fullname = fullname.trim();
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
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Passwords do not match" });
    }

    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email format" });
    }
    const newUser = new User({
      email,
      fullname,
      password: hashedPassword,
      role,
      avatar,
    });
    await newUser.save();
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ success: true, message: "User registered successfully" });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
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
        .status(404)
        .json({ success: false, message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
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

    res.status(200).json({ success: true, message: "Login successful" });
  } catch (error) {
    logger.error("Error logging in user:", error);
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
}