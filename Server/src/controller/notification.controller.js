import Notification from "../models/Notifications.js";
import { StatusCodes } from "http-status-codes";

// GET /api/notifications
export const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, isRead, type } = req.query;

    const filter = { userId: req.user.id };

    if (isRead !== undefined) {
      filter.isRead = isRead === "true";
    }

    if (type) {
      filter.type = type;
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Notification.countDocuments(filter),
      Notification.countDocuments({ userId: req.user.id, isRead: false }),
    ]);

    const formattedNotifications = notifications.map((n) => ({
      id: n._id,
      title: n.title,
      message: n.message,
      type: n.type,
      isRead: n.isRead,
      createdAt: n.createdAt,
    }));

    return res.status(StatusCodes.OK).json({
      success: true,
      statusCode: StatusCodes.OK,
      data: {
        notifications: formattedNotifications,
        pagination: {
          total,
          page: pageNum,
          pages: Math.ceil(total / limitNum),
          limit: limitNum,
        },
        unreadCount,
      },
    });
  } catch (error) {
    console.error("Get Notifications Error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Internal Server Error",
    });
  }
};

// PUT /api/notifications/:notificationId/read
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findOne({
      _id: notificationId,
      userId: req.user.id,
    });

    if (!notification) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        statusCode: StatusCodes.NOT_FOUND,
        message: "Notification not found",
      });
    }

    notification.isRead = true;
    await notification.save();

    return res.status(StatusCodes.OK).json({
      success: true,
      statusCode: StatusCodes.OK,
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error("Mark Notification Read Error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Internal Server Error",
    });
  }
};

// PUT /api/notifications/read-all
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, isRead: false },
      { isRead: true }
    );

    return res.status(StatusCodes.OK).json({
      success: true,
      statusCode: StatusCodes.OK,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Mark All Notifications Read Error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Internal Server Error",
    });
  }
};

// DELETE /api/notifications/:notificationId
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const result = await Notification.deleteOne({
      _id: notificationId,
      userId: req.user.id,
    });

    if (result.deletedCount === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        statusCode: StatusCodes.NOT_FOUND,
        message: "Notification not found",
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      statusCode: StatusCodes.OK,
      message: "Notification deleted",
    });
  } catch (error) {
    console.error("Delete Notification Error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Internal Server Error",
    });
  }
};