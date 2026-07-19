import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import type { Request, Response } from "express";
import { Project } from "../models/project.model.js";
import mongoose, { Types } from "mongoose";
import { Task } from "../models/task.model.js";
import { TaskStatusEnum } from "../types/enums/task.enum.js";

interface ProjectParams {
  projectId?: string;
}

export const commonTaskAggregationStages = [
  {
    $lookup: {
      from: "users",
      localField: "assignees",
      foreignField: "_id",
      as: "assignees",
      pipeline: [
        {
          $project: {
            _id: 0,
            id: { $toString: "$_id" },
            fullName: 1,
            avatar: 1,
          },
        },
      ],
    },
  },
  {
    $lookup: {
      from: "projects",
      localField: "projectId",
      foreignField: "_id",
      as: "project",
      pipeline: [
        {
          $project: {
            _id: 0,
            id: { $toString: "$_id" },
            name: 1,
          },
        },
      ],
    },
  },
  {
    $unwind: { path: "$project", preserveNullAndEmptyArrays: true },
  },
  {
    $project: {
      id: { $toString: "$_id" },
      _id: 0,
      title: 1,
      description: 1,
      status: 1,
      project: 1,
      priority: 1,
      assignees: {
        $map: {
          input: "$assignees",
          as: "assignee",
          in: {
            id: "$$assignee.id",
            fullName: "$$assignee.fullName",
            avatar: "$$assignee.avatar",
          },
        },
      },
      dueDate: 1,
      createdAt: 1,
      updatedAt: 1,
    },
  },
];

export const createTask = asyncHandler(
  async (req: Request<ProjectParams>, res: Response) => {
    const { title, description, priority, dueDate, assignees, projectId } =
      req.body;
    const userId = req.user._id;

    console.log("req", req.body);

    if (!projectId) {
      throw new ApiError(404, "Project ID is required");
    }

    const project = await Project.findOne({
      _id: projectId,
      members: req.user._id,
    });

    if (!project) {
      throw new ApiError(404, "Project not found or access denied");
    }

    const existTask = await Task.findOne({
      title,
    });

    if (existTask) {
      throw new ApiError(400, "Task with this name already exist");
    }

    const task = await Task.create({
      title,
      description,
      status: TaskStatusEnum.TODO,
      priority,
      dueDate,
      createdBy: userId,
      projectId: projectId,
      assignees,
    });
    if (!task) {
      throw new ApiError(500, "Something went wrong while creating new task");
    }
    const [createdTask] = await Task.aggregate([
      {
        $match: {
          _id: task._id,
        },
      },
      ...commonTaskAggregationStages,
    ]);
    if (!createdTask) {
      throw new ApiError(500, "Failed to fetch newly created task");
    }

    return res
      .status(200)
      .json(new ApiResponse(201, createdTask, "Successfully created new task"));
  },
);

export const deleteTaskById = asyncHandler(
  async (req: Request, res: Response) => {
    const { taskId } = req.params;

    if (!taskId) {
      throw new ApiError(400, "Task ID is required");
    }

    const task = await Task.findById(taskId);

    if (!task) {
      throw new ApiError(404, "Task not found ");
    }

    const isTaskCreater = await Task.findOne({
      _id: task._id,
      createdBy: req.user._id,
    });

    if (!isTaskCreater) {
      throw new ApiError(409, "Access denied");
    }

    const deleteTask = await Task.findByIdAndDelete(taskId);

    if (!deleteTask) {
      throw new ApiError(404, "Project does not exist");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Task deleted successfully"));
  },
);

export const updateTaskDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const { title, description, priority, dueDate } = req.body;

    const { taskId } = req.params;

    if (!taskId) {
      throw new ApiError(400, "Task ID is required");
    }

    const task = await Task.findById(taskId);

    if (!task) {
      throw new ApiError(404, "Task not found ");
    }

    const isAssignee = task.assignees.some(
      (id) => id.toString() === req.user._id.toString(),
    );

    const isTaskCreater = await Task.findOne({
      createdBy: req.user._id,
    });

    if (!isTaskCreater && !isAssignee) {
      throw new ApiError(400, "Access denied");
    }

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      {
        $set: {
          title,
          description,
          dueDate,
          priority: priority,
        },
      },
      {
        new: true,
      },
    );
    if (!updatedTask) {
      throw new ApiError(404, "Task does not exist");
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, updatedTask, "Updated task details successfully"),
      );
  },
);

export const getAllProjectTasks = asyncHandler(
  async (req: Request, res: Response) => {
    const { projectId } = req.params;

    const existedProject = await Project.findById(projectId);

    if (!existedProject) {
      throw new ApiError(404, "Project ID is requied");
    }

    const isProjectMember = existedProject.members.some(
      (id) => id.toString() === req.user._id.toString(),
    );

    if (!isProjectMember) {
      throw new ApiError(400, "Access denied");
    }

    const tasks = await Task.aggregate([
      {
        $match: {
          projectId: new mongoose.Types.ObjectId(existedProject._id),
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    return res
      .status(200)
      .json(new ApiResponse(200, tasks || [], "Tasks fetched successfully"));
  },
);

export const getAllTasks = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user._id;
  const tasks = await Task.aggregate([
    {
      $match: {
        assignees: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "assignees",
        foreignField: "_id",
        as: "assignees",
        pipeline: [
          {
            $project: {
              id: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "projects",
        localField: "projectId",
        foreignField: "_id",
        as: "project",
        pipeline: [
          {
            $project: {
              _id: 0,
              id: { $toString: "$_id" },
              name: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: { path: "$project", preserveNullAndEmptyArrays: true },
    },
    {
      $project: {
        id: { $toString: "$_id" },
        _id: 0,
        title: 1,
        description: 1,
        status: 1,
        project: 1,
        priority: 1,
        assignees: {
          $map: {
            input: "$assignees",
            as: "assignee",
            in: {
              id: { $toString: "$$assignee._id" },
              fullName: "$$assignee.fullName",
              avatar: "$$assignee.avatar",
            },
          },
        },
        tags: 1,
        dueDate: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
    {
      $sort: { createdAt: -1 },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, tasks || [], "Successfuly fetch all tasks"));
});

export const changeTaskStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { taskStatus } = req.body;
    const { taskId } = req.params;

    const task = await Task.findByIdAndUpdate(
      taskId,
      {
        $set: {
          status: taskStatus,
        },
      },
      { new: true },
    );

    if (!task) {
      throw new ApiError(400, "Task does not exist");
    }

    const [updatedTask] = await Task.aggregate([
      {
        $match: {
          _id: task._id,
        },
      },
      ...commonTaskAggregationStages,
    ]);
    if (!updatedTask) {
      throw new ApiError(500, "Failed to fetch newly updated task");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedTask,
          "Project status updated successfully",
        ),
      );
  },
);

export const getTaskById = asyncHandler(async (req: Request, res: Response) => {
  const { taskId } = req.params;
  console.log(taskId);

  if (
    !taskId ||
    typeof taskId !== "string" ||
    !Types.ObjectId.isValid(taskId)
  ) {
    throw new ApiError(400, "Invalid task id");
  }

  const [task] = await Task.aggregate([
    {
      $match: {
        _id: new Types.ObjectId(taskId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "assignees",
        foreignField: "_id",
        as: "assignees",
        pipeline: [
          {
            $project: {
              _id: 0,
              id: { $toString: "$_id" },
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "createdBy",
        foreignField: "_id",
        as: "createdBy",
        pipeline: [
          {
            $project: {
              _id: 0,
              id: { $toString: "$_id" },
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "projects",
        localField: "projectId",
        foreignField: "_id",
        as: "project",
        pipeline: [
          {
            $project: {
              _id: 0,
              id: { $toString: "$_id" },
              name: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: { path: "$project", preserveNullAndEmptyArrays: true },
    },
    { $unwind: { path: "$createdBy", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        id: { $toString: "$_id" },
        title: 1,
        description: 1,
        status: 1,
        project:1,
        priority: 1,
        assignees: {
          $map: {
            input: "$assignees",
            as: "assignee",
            in: {
              id: "$$assignee.id",
              fullName: "$$assignee.fullName",
              avatar: "$$assignee.avatar",
            },
          },
        },
        dueDate: 1,
        createdBy: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);
  if (!task) {
    throw new ApiError(404, "Task not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, task, "Successfully get taskById"));
});
