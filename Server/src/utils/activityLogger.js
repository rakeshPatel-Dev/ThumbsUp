import ActivityLog from "../models/ActivityLog.js";

/**
 * Log an activity to the database.
 * @param {string|ObjectId} userId - User performing action
 * @param {string} action - Action performed (e.g. TASK_CREATE)
 * @param {string} entityType - Type of entity affected (e.g. Task)
 * @param {string} entityId - Entity identifier
 * @param {object} changes - Changes made
 * @param {object} req - Express request object (optional, for ip/userAgent)
 */
export const logActivity = async (userId, action, entityType, entityId, changes = {}, req = null) => {
  try {
    let ip = null;
    let userAgent = null;

    if (req) {
      ip = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress;
      userAgent = req.headers["user-agent"];
    }

    const log = new ActivityLog({
      userId,
      action,
      entityType,
      entityId,
      changes,
      ip,
      userAgent,
    });

    await log.save();
    console.log(`[ActivityLog] Action logged: ${action} by User ${userId}`);
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};
