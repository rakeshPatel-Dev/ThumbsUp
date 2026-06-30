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

export const getTask = async (req, res) => {
  try {
    const task = await Task.find({ createdBy: req.user.id });
    if (!task) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "No tasks found for this user",
      });
    }
    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Tasks retrieved successfully",
      data: { tasks: task },
    });
  } catch (error) {
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
      createdBy: req.user.id,
    }).populate("createdBy", "fullname email");

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
    const task = await Task.findByIdAndDelete({
      _id: req.params.id,
      createdBy: req.user.id,
    });

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
