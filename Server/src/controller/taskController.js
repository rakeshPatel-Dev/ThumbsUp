import Task from "../models/Task.js";

export const createTask = async (req, res) => {
  try {
    const { title, description, priority, deadline, category, attachment } =
      req.body;

    // Validate required fields
    if (
      !title ||
      !description ||
      !priority ||
      !deadline ||
      !category ||
      !attachment
    ) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "All fields are required",
      });
    }

    // Validate deadline
    if (isNaN(Date.parse(deadline))) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Invalid deadline",
      });
    }

    // Create task
    const task = await Task.create({
      title,
      description,
      priority,
      deadline,
      category,
      attachment,
      status: "pending",
      createdBy: req.user.id, // Assuming JWT middleware sets req.user.id
    });

    // Populate createdBy so we can return name/id
    await task.populate("createdBy", "name");

    return res.status(201).json({
      success: true,
      statusCode: 201,
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
          attachment: task.attachment,
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

    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal Server Error",
    });
  }
};

// export const getTask = async (req, res) => {
//   try {
//     const task = await Task.find();
//     if (!task) {
//       return res.status(404).json({
//         success: false,
//         statusCode: 404,
//         message: "No tasks found for this user",
//       });
//     }
//     return res.status(200).json({
//       success: true,
//       statusCode: 200,
//       message: "Tasks retrieved successfully",
//       data: { tasks: task },
//     });
//   } catch (error) {
//     console.error("Get Task Error:", error);
//     return res.status(500).json({
//       success: false,
//       statusCode: 500,
//       message: "Internal Server Error",
//     });
//   }
// };

export const getTask = async (req, res) => {
  try {
    // ─── Query Params ───────────────────────────────────────
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

    // ─── Build Filter ────────────────────────────────────────
    const filter = {};

    // Role-based filtering
    if (req.user.role === "user") {
      filter.createdBy = req.user.id; // users only see their own tasks
    }

    if (status)   filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;

    // Search in title or description
    if (search) {
      filter.$or = [
        { title:       { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate)   filter.createdAt.$lte = new Date(endDate);
    }

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit))); // cap at 100
    const skip     = (pageNum - 1) * limitNum;

    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [tasks, total, stats] = await Promise.all([
      Task.find(filter)
        .populate("createdBy", "name email")
        .sort(sort)
        .skip(skip)
        .limit(limitNum),

      Task.countDocuments(filter),

      // Stats counts
      Task.aggregate([
        { $match: filter },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
    ]);

    // Format stats into a clean object
    const statsFormatted = {
      total,
      pending:   0,
      approved:  0,
      rejected:  0,
      completed: 0,
    };
    stats.forEach(({ _id, count }) => {
      if (_id in statsFormatted) statsFormatted[_id] = count;
    });

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Tasks retrieved successfully",
      data: {
        tasks,
        pagination: {
          total,
          page:  pageNum,
          pages: Math.ceil(total / limitNum),
          limit: limitNum,
        },
        stats: statsFormatted,
      },
    });
  } catch (error) {
    console.error("Get Task Error:", error);
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal Server Error",
    });
  }
};
export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }
    return res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal Server Error",
    });
  }
};
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
    });
    console.log("Deleted task:", task);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    Object.assign(task, req.body);

    await task.save();

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: task,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
