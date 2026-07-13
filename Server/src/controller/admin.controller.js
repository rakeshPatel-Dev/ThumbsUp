import User from "../models/User.js";
import Task from "../models/Task.js";
import ActivityLog from "../models/ActivityLog.js";
import { StatusCodes } from "http-status-codes";

// GET /api/admin/dashboard
export const getDashboardStats = async (req, res) => {
  try {
    // 1. Core Counts
    const [
      totalUsers,
      activeUsers,
      totalTasks,
      pendingTasks,
      approvedTasks,
      rejectedTasks,
      completedTasks
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Task.countDocuments({ isDeleted: false }),
      Task.countDocuments({ status: "pending", isDeleted: false }),
      Task.countDocuments({ status: "approved", isDeleted: false }),
      Task.countDocuments({ status: "rejected", isDeleted: false }),
      Task.countDocuments({ status: "completed", isDeleted: false }),
    ]);

    // 2. Recent Activity (last 10 logs)
    const recentLogs = await ActivityLog.find()
      .sort({ timestamp: -1 })
      .limit(10)
      .populate("userId", "name");

    const recentActivity = recentLogs.map((log) => {
      // Human-readable action description
      let actionDesc = log.action;
      if (log.action === "TASK_CREATE") actionDesc = "Created task";
      else if (log.action === "TASK_APPROVED") actionDesc = "Approved task";
      else if (log.action === "TASK_REJECTED") actionDesc = "Rejected task";
      else if (log.action === "TASK_COMPLETED") actionDesc = "Completed task";
      else if (log.action === "USER_LOGIN") actionDesc = "Logged in";
      else if (log.action === "USER_REGISTER") actionDesc = "Registered account";
      else if (log.action === "PROFILE_UPDATE") actionDesc = "Updated profile";
      else if (log.action === "USER_ROLE_UPDATE") actionDesc = "Updated user role";
      else if (log.action === "USER_SUSPEND") actionDesc = "Suspended user";
      else if (log.action === "USER_UNSUSPEND") actionDesc = "Unsuspended user";

      return {
        user: log.userId ? log.userId.name : "System / Unknown",
        action: actionDesc,
        timestamp: log.timestamp,
      };
    });

    // 3. Trends for Last 6 Months
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const labels = [];
    const createdCounts = [];
    const completedCounts = [];
    const newUsersCounts = [];

    // Initialize 6 months structure
    const monthsData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const year = d.getFullYear();
      const month = d.getMonth(); // 0-indexed
      labels.push(monthNames[month]);

      monthsData.push({
        year,
        month,
        created: 0,
        completed: 0,
        newUsers: 0
      });
    }

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 5);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    // Retrieve tasks created and completed in the range
    const [tasksCreatedTrend, tasksCompletedTrend, usersGrowthTrend] = await Promise.all([
      Task.aggregate([
        {
          $match: {
            isDeleted: false,
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $subtract: [{ $month: "$createdAt" }, 1] } // Group by 0-indexed month
            },
            count: { $sum: 1 }
          }
        }
      ]),
      Task.aggregate([
        {
          $match: {
            status: "completed",
            isDeleted: false,
            updatedAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: "$updatedAt" },
              month: { $subtract: [{ $month: "$updatedAt" }, 1] }
            },
            count: { $sum: 1 }
          }
        }
      ]),
      User.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $subtract: [{ $month: "$createdAt" }, 1] }
            },
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    // Map trends to monthsData
    tasksCreatedTrend.forEach((item) => {
      const idx = monthsData.findIndex(
        (m) => m.year === item._id.year && m.month === item._id.month
      );
      if (idx !== -1) {
        monthsData[idx].created = item.count;
      }
    });

    tasksCompletedTrend.forEach((item) => {
      const idx = monthsData.findIndex(
        (m) => m.year === item._id.year && m.month === item._id.month
      );
      if (idx !== -1) {
        monthsData[idx].completed = item.count;
      }
    });

    usersGrowthTrend.forEach((item) => {
      const idx = monthsData.findIndex(
        (m) => m.year === item._id.year && m.month === item._id.month
      );
      if (idx !== -1) {
        monthsData[idx].newUsers = item.count;
      }
    });

    // Populate trend lists
    monthsData.forEach((m) => {
      createdCounts.push(m.created);
      completedCounts.push(m.completed);
      newUsersCounts.push(m.newUsers);
    });
    

    return res.status(StatusCodes.OK).json({
      success: true,
      statusCode: StatusCodes.OK,
      data: {
        stats: {
          totalUsers,
          activeUsers,
          totalTasks,
          pendingTasks,
          completedTasks,
          rejectedTasks,
          approvedTasks
        },
        recentActivity,
        taskTrends: {
          labels,
          created: createdCounts,
          completed: completedCounts
        },
        userGrowth: {
          labels,
          newUsers: newUsersCounts
        }
      }
    });
  } catch (error) {
    console.error("Admin Dashboard Stats Error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Internal Server Error",
    });
  }
};

// GET /api/admin/logs
export const getSystemLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      userId,
      action,
      entityType,
      startDate,
      endDate,
    } = req.query;

    const filter = {};

    if (userId) filter.userId = userId;
    if (action) filter.action = action;
    if (entityType) filter.entityType = entityType;

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      ActivityLog.find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate("userId", "name email"),
      ActivityLog.countDocuments(filter),
    ]);

    const formattedLogs = logs.map((log) => ({
      user: log.userId
        ? {
          id: log.userId._id,
          name: log.userId.name,
        }
        : null,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      changes: log.changes,
      ip: log.ip,
      userAgent: log.userAgent,
      timestamp: log.timestamp,
    }));

    return res.status(StatusCodes.OK).json({
      success: true,
      statusCode: StatusCodes.OK,
      data: {
        logs: formattedLogs,
        pagination: {
          total,
          page: pageNum,
          pages: Math.ceil(total / limitNum),
          limit: limitNum,
        },
      },
    });
  } catch (error) {
    console.error("Get System Logs Error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Internal Server Error",
    });
  }
};
