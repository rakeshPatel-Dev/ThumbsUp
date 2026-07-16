import User from "../models/User.js";
import Task from "../models/Task.js";
import Notification from "../models/Notifications.js";
import { logActivity } from "../utils/activityLogger.js";
import { StatusCodes } from "http-status-codes";
import { sendAccountDeletedEmail } from "../services/email.service.js";

// GET /api/users/profile
export const Profile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        statusCode: StatusCodes.NOT_FOUND,
        message: "User not found",
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      statusCode: StatusCodes.OK,
      message: "Profile fetched successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          isActive: user.isActive,
          isEmailVerified: user.isEmailVerified,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    console.error("Fetch Profile Error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Internal Server Error",
    });
  }
};

// PUT /api/users/profile
export const updateProfile = async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        statusCode: StatusCodes.NOT_FOUND,
        message: "User not found",
      });
    }

    const changes = {};
    if (name !== undefined) {
      changes.name = name;
      user.name = name;
    }
    if (avatar !== undefined) {
      changes.avatar = avatar;
      user.avatar = avatar;
    }

    await user.save();

    await logActivity(req.user.id, "PROFILE_UPDATE", "User", user._id.toString(), changes, req);

    return res.status(StatusCodes.OK).json({
      success: true,
      statusCode: StatusCodes.OK,
      message: "Profile updated successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      },
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Internal Server Error",
    });
  }
};

// GET /api/users (Admin Only)
export const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      isActive,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const filter = {};

    if (role) {
      filter.role = role;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password")
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      User.countDocuments(filter),
    ]);

    const formattedUsers = users.map((u) => ({
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      avatar: u.avatar,
      isActive: u.isActive,
      isEmailVerified: u.isEmailVerified,
      lastLogin: u.lastLogin,
      createdAt: u.createdAt,
    }));

    return res.status(StatusCodes.OK).json({
      success: true,
      statusCode: StatusCodes.OK,
      data: {
        users: formattedUsers,
        pagination: {
          total,
          page: pageNum,
          pages: Math.ceil(total / limitNum),
          limit: limitNum,
        },
      },
    });
  } catch (error) {
    console.error("Get Users Error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Internal Server Error",
    });
  }
};

// PUT /api/users/:userId/role (Admin Only)
export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!role || !["employee", "manager", "admin"].includes(role)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        statusCode: StatusCodes.BAD_REQUEST,
        message: "Invalid role. Must be 'employee', 'manager', or 'admin'.",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        statusCode: StatusCodes.NOT_FOUND,
        message: "User not found",
      });
    }

    const oldRole = user.role;
    user.role = role;
    await user.save();

    await logActivity(
      req.user.id,
      "USER_ROLE_UPDATE",
      "User",
      user._id.toString(),
      { oldRole, newRole: role },
      req
    );

    return res.status(StatusCodes.OK).json({
      success: true,
      statusCode: StatusCodes.OK,
      message: "User role updated successfully",
    });
  } catch (error) {
    console.error("Update User Role Error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Internal Server Error",
    });
  }
};

// PUT /api/users/:userId/suspend (Admin Only)
export const suspendUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { action } = req.body; // "suspend" or "unsuspend"

    if (!action || !["suspend", "unsuspend"].includes(action)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        statusCode: StatusCodes.BAD_REQUEST,
        message: "Invalid action. Action must be 'suspend' or 'unsuspend'.",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        statusCode: StatusCodes.NOT_FOUND,
        message: "User not found",
      });
    }

    const targetStatus = action === "unsuspend";
    const oldStatus = user.isActive;
    user.isActive = targetStatus;
    await user.save();

    await logActivity(
      req.user.id,
      action === "suspend" ? "USER_SUSPEND" : "USER_UNSUSPEND",
      "User",
      user._id.toString(),
      { oldStatus, newStatus: targetStatus },
      req
    );

    return res.status(StatusCodes.OK).json({
      success: true,
      statusCode: StatusCodes.OK,
      message: `User ${action}ed successfully`,
    });
  } catch (error) {
    console.error("Suspend/Unsuspend User Error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Internal Server Error",
    });
  }
};

// DELETE /api/users/account
export const deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        statusCode: StatusCodes.NOT_FOUND,
        message: "User not found",
      });
    }

    if (user.role === "admin") {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        statusCode: StatusCodes.FORBIDDEN,
        message: "Admins cannot delete their own account.",
      });
    }

    const userId = user._id;

    await logActivity(
      userId,
      "ACCOUNT_DELETED",
      "User",
      userId.toString(),
      { role: user.role },
      req,
    );

    await sendAccountDeletedEmail(user.email, user.name).catch((err) => {
      console.error(`Error sending account deletion email to ${user.email}:`, err);
    });

    await Task.updateMany({ createdBy: userId }, { isDeleted: true });
    await Notification.deleteMany({ userId });

    await User.findByIdAndDelete(userId);

    res.clearCookie("token");
    res.clearCookie("refreshToken");

    return res.status(StatusCodes.OK).json({
      success: true,
      statusCode: StatusCodes.OK,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Delete Account Error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Internal Server Error",
    });
  }
};
