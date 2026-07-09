import Task from "../models/Task.js";
import Notification from "../models/Notifications.js";
import User from "../models/User.js";
import { logActivity } from "../utils/activityLogger.js";
import { StatusCodes } from "http-status-codes";

// Helper to create notifications
const createNotification = async (userId, title, message, type) => {
  try {
    const notif = new Notification({
      userId,
      title,
      message,
      type,
    });
    await notif.save();
    console.log(`[Notification] Created: "${title}" for User ${userId}`);
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
};

// POST /api/tasks
export const createTask = async (req, res) => {
  try {
    // Only employees can create tasks
    if (req.user.role !== "employee") {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        statusCode: StatusCodes.FORBIDDEN,
        message: "Only employees can create tasks.",
      });
    }

    const { title, description, priority = "medium", deadline, category, attachmentUrl } = req.body;

    // Validate required fields
    if (!title || !description) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        statusCode: StatusCodes.BAD_REQUEST,
        message: "Title and description are required",
      });
    }

    if (title.length < 3 || title.length > 100) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        statusCode: StatusCodes.BAD_REQUEST,
        message: "Title must be between 3 and 100 characters",
      });
    }

    if (description.length > 1000) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        statusCode: StatusCodes.BAD_REQUEST,
        message: "Description must be less than 1000 characters",
      });
    }

    if (priority && !["low", "medium", "high", "critical"].includes(priority)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        statusCode: StatusCodes.BAD_REQUEST,
        message: "Priority must be low, medium, high, or critical",
      });
    }

    // Validate deadline (must be in future)
    let parsedDeadline = null;
    if (deadline) {
      parsedDeadline = new Date(deadline);
      if (isNaN(parsedDeadline.getTime())) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          statusCode: StatusCodes.BAD_REQUEST,
          message: "Invalid deadline date format",
        });
      }
      if (parsedDeadline <= new Date()) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          statusCode: StatusCodes.BAD_REQUEST,
          message: "Deadline must be a future date",
        });
      }
    }

    // Create task
    const task = new Task({
      title,
      description,
      priority,
      deadline: parsedDeadline,
      category,
      attachmentUrl,
      status: "pending",
      createdBy: req.user.id,
    });

    await task.save();
    await task.populate("createdBy", "name email");

    // Log activity
    await logActivity(req.user.id, "TASK_CREATE", "Task", task._id.toString(), { title, priority }, req);

    console.log(`User ${req.user.id} and name ${req.user.name} . User = ${JSON.stringify(req.user)}`);

    // Notify managers
    const managers = await User.find({ role: "manager" });
    for (const manager of managers) {
      await createNotification(
        manager._id,
        "New Task",
        `A new task "${task.title}" has been created by ${req.user.name}.`,
        "task_created"
      );
    }

    // For now, let's also log a notification info
    return res.status(StatusCodes.CREATED).json({
      success: true,
      statusCode: StatusCodes.CREATED,
      message: "Task created successfully",
      data: {
        task: {
          id: task._id,
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: task.status,
          deadline: task.deadline,
          category: task.category,
          attachmentUrl: task.attachmentUrl,
          createdBy: {
            id: task.createdBy._id,
            name: task.createdBy.name,
          },
          createdAt: task.createdAt,
        },
      },
    });
  } catch (error) {
    console.error("Create Task Error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Internal Server Error",
    });
  }
};

// GET /api/tasks
export const getTask = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      category,
      search,
      startDate,
      endDate,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const filter = { isDeleted: false };

    // Role-based visibility
    if (req.user.role === "employee") {
      filter.createdBy = req.user.id;
    }

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [tasks, total, statsAggregation] = await Promise.all([
      Task.find(filter)
        .populate("createdBy", "name email")
        .populate("approvedBy", "name email")
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      Task.countDocuments(filter),
      Task.aggregate([
        { $match: filter },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
    ]);

    const stats = {
      total,
      pending: 0,
      approved: 0,
      rejected: 0,
      completed: 0,
    };

    statsAggregation.forEach(({ _id, count }) => {
      if (_id in stats) {
        stats[_id] = count;
      }
    });

    const formattedTasks = tasks.map((t) => ({
      id: t._id,
      title: t.title,
      description: t.description,
      priority: t.priority,
      status: t.status,
      deadline: t.deadline,
      category: t.category,
      attachmentUrl: t.attachmentUrl,
      createdBy: t.createdBy
        ? {
          id: t.createdBy._id,
          name: t.createdBy.name,
          email: t.createdBy.email,
        }
        : null,
      approvedBy: t.approvedBy
        ? {
          id: t.approvedBy._id,
          name: t.approvedBy.name,
          email: t.approvedBy.email,
        }
        : null,
      rejectionReason: t.rejectionReason,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));

    return res.status(StatusCodes.OK).json({
      success: true,
      statusCode: StatusCodes.OK,
      data: {
        tasks: formattedTasks,
        pagination: {
          total,
          page: pageNum,
          pages: Math.ceil(total / limitNum),
          limit: limitNum,
        },
        stats,
      },
    });
  } catch (error) {
    console.error("Get Tasks Error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Internal Server Error",
    });
  }
};

// GET /api/tasks/:id
export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, isDeleted: false })
      .populate("createdBy", "name email")
      .populate("approvedBy", "name email");

    if (!task) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        statusCode: StatusCodes.NOT_FOUND,
        message: "Task not found",
      });
    }

    // Access control: employee can only see their own tasks
    if (req.user.role === "employee" && task.createdBy._id.toString() !== req.user.id) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        statusCode: StatusCodes.FORBIDDEN,
        message: "Access denied. You can only view your own tasks.",
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      statusCode: StatusCodes.OK,
      data: {
        task: {
          id: task._id,
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: task.status,
          deadline: task.deadline,
          category: task.category,
          attachmentUrl: task.attachmentUrl,
          createdBy: {
            id: task.createdBy._id,
            name: task.createdBy.name,
            email: task.createdBy.email,
          },
          approvedBy: task.approvedBy
            ? {
              id: task.approvedBy._id,
              name: task.approvedBy.name,
              email: task.approvedBy.email,
            }
            : null,
          rejectionReason: task.rejectionReason,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error("Get Task By ID Error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Internal Server Error",
    });
  }
};

// PUT /api/tasks/:id
export const updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, isDeleted: false });

    if (!task) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        statusCode: StatusCodes.NOT_FOUND,
        message: "Task not found",
      });
    }

    const { status, title, description, priority, deadline, category, attachmentUrl, rejectionReason } = req.body;

    // 1. Employee Role Path
    if (req.user.role === "employee") {
      // Must be the owner of the task
      if (task.createdBy.toString() !== req.user.id) {
        return res.status(StatusCodes.FORBIDDEN).json({
          success: false,
          statusCode: StatusCodes.FORBIDDEN,
          message: "Access denied. You can only update your own tasks.",
        });
      }

      // Case A: Employee wants to update status (only marking it completed is allowed, and only if approved)
      if (status !== undefined) {
        if (status !== "completed") {
          return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            statusCode: StatusCodes.BAD_REQUEST,
            message: "Employees can only transition tasks to 'completed' status.",
          });
        }
        if (task.status !== "approved") {
          return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            statusCode: StatusCodes.BAD_REQUEST,
            message: "Tasks can only be marked as completed if they are in 'approved' status.",
          });
        }

        task.status = "completed";
        await task.save();
        await logActivity(req.user.id, "TASK_COMPLETED", "Task", task._id.toString(), { oldStatus: "approved", newStatus: "completed" }, req);

        return res.status(StatusCodes.OK).json({
          success: true,
          statusCode: StatusCodes.OK,
          message: "Task marked as completed",
          data: { task },
        });
      }

      // Case B: Employee wants to update task details (only allowed if pending)
      if (task.status !== "pending") {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          statusCode: StatusCodes.BAD_REQUEST,
          message: "You can only edit task details in pending status.",
        });
      }

      const changes = {};

      if (title !== undefined) {
        if (title.length < 3 || title.length > 100) {
          return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            statusCode: StatusCodes.BAD_REQUEST,
            message: "Title must be between 3 and 100 characters",
          });
        }
        changes.title = title;
        task.title = title;
      }

      if (description !== undefined) {
        if (description.length > 1000) {
          return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            statusCode: StatusCodes.BAD_REQUEST,
            message: "Description must be less than 1000 characters",
          });
        }
        changes.description = description;
        task.description = description;
      }

      if (priority !== undefined) {
        if (!["low", "medium", "high", "critical"].includes(priority)) {
          return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            statusCode: StatusCodes.BAD_REQUEST,
            message: "Priority must be low, medium, high, or critical",
          });
        }
        changes.priority = priority;
        task.priority = priority;
      }

      if (deadline !== undefined) {
        let parsedDeadline = null;
        if (deadline) {
          parsedDeadline = new Date(deadline);
          if (isNaN(parsedDeadline.getTime())) {
            return res.status(StatusCodes.BAD_REQUEST).json({
              success: false,
              statusCode: StatusCodes.BAD_REQUEST,
              message: "Invalid deadline date format",
            });
          }
          if (parsedDeadline <= new Date()) {
            return res.status(StatusCodes.BAD_REQUEST).json({
              success: false,
              statusCode: StatusCodes.BAD_REQUEST,
              message: "Deadline must be a future date",
            });
          }
        }
        changes.deadline = parsedDeadline;
        task.deadline = parsedDeadline;
      }

      if (category !== undefined) {
        changes.category = category;
        task.category = category;
      }

      if (attachmentUrl !== undefined) {
        changes.attachmentUrl = attachmentUrl;
        task.attachmentUrl = attachmentUrl;
      }

      await task.save();
      await logActivity(req.user.id, "TASK_UPDATE", "Task", task._id.toString(), changes, req);

      return res.status(StatusCodes.OK).json({
        success: true,
        statusCode: StatusCodes.OK,
        message: "Task updated successfully",
        data: { task },
      });
    }

    // 2. Manager Role Path (Can only approve or reject)
    if (req.user.role === "manager") {
      if (status === undefined) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          statusCode: StatusCodes.BAD_REQUEST,
          message: "Managers can only update the status of a task.",
        });
      }

      if (!["approved", "rejected"].includes(status)) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          statusCode: StatusCodes.BAD_REQUEST,
          message: "Managers can only approve or reject tasks.",
        });
      }

      // Can only approve or reject tasks that are currently pending
      if (task.status !== "pending") {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          statusCode: StatusCodes.BAD_REQUEST,
          message: "Managers can only approve or reject tasks in pending status.",
        });
      }

      const changes = { oldStatus: task.status, newStatus: status };

      if (status === "rejected") {
        if (rejectionReason && rejectionReason.trim() !== "") {
          task.rejectionReason = rejectionReason.trim();
          changes.rejectionReason = rejectionReason.trim();
        } else if (!task.rejectionReason) {
          task.rejectionReason = "Rejected by manager";
        }
      } else {
        task.rejectionReason = null;
      }

      task.status = status;
      task.approvedBy = req.user.id;
      await task.save();

      await logActivity(req.user.id, `TASK_${status.toUpperCase()}`, "Task", task._id.toString(), changes, req);

      const notifTitle = `Task ${status.charAt(0).toUpperCase() + status.slice(1)}`;
      const notifMessage = `Your task "${task.title}" has been ${status}${status === "rejected" ? `. Reason: ${task.rejectionReason}` : ""}`;
      const notifType = `task_${status}`;
      await createNotification(task.createdBy, notifTitle, notifMessage, notifType);

      return res.status(StatusCodes.OK).json({
        success: true,
        statusCode: StatusCodes.OK,
        message: `Task ${status} successfully`,
        data: { task },
      });
    }

    // 3. Admin / Other Roles Path (Admin cannot update status/details anyhow)
    return res.status(StatusCodes.FORBIDDEN).json({
      success: false,
      statusCode: StatusCodes.FORBIDDEN,
      message: "Access denied. Admin cannot update task details or status.",
    });

  } catch (error) {
    console.error("Update Task Error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Internal Server Error",
    });
  }
};

// DELETE /api/tasks/:id
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, isDeleted: false });

    if (!task) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        statusCode: StatusCodes.NOT_FOUND,
        message: "Task not found",
      });
    }

    // Only employees who created the task can delete it
    if (req.user.role !== "employee" || task.createdBy.toString() !== req.user.id) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        statusCode: StatusCodes.FORBIDDEN,
        message: "Access denied. Only the task creator can delete it.",
      });
    }

    if (task.status !== "pending") {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        statusCode: StatusCodes.BAD_REQUEST,
        message: "You can only delete tasks in pending status.",
      });
    }

    // Soft delete
    task.isDeleted = true;
    await task.save();

    await logActivity(req.user.id, "TASK_DELETE", "Task", task._id.toString(), { softDelete: true }, req);

    return res.status(StatusCodes.OK).json({
      success: true,
      statusCode: StatusCodes.OK,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete Task Error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Internal Server Error",
    });
  }
};
