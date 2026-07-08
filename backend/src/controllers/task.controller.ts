import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import type { Request, Response } from "express";
import { Project } from "../models/project.model.js";
import mongoose from "mongoose";
import { Task } from "../models/task.model.js";
import { TaskStatusEnum } from "../types/enums/task.enum.js";

interface ProjectParams {
  projectId?: string;
}

export const createTask = asyncHandler(
  async (req: Request<ProjectParams>, res: Response) => {
    const { title, description, status, priority, dueDate, assignees, tags } =
      req.body;
    const { projectId } = req.params;
    const userId = req.user._id;

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

    const existTask=await Task.findOne({
      title
    })

    if(existTask){
      throw new ApiError(400,"Task with this name already exist")
    }

    const createdTask = await Task.create({
      title,
      description,
      status: status || TaskStatusEnum.TODO,
      priority,
      dueDate,
      createdBy: userId,
      projectId: projectId,
      assignees,
      tags,
    });
    if (!createdTask) {
      throw new ApiError(500, "Something went wrong while creating new task");
    }
    return res
      .status(200)
      .json(new ApiResponse(201, createdTask, "Successfully created new task"));
  },
);

export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
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
    throw new ApiError(409, "Access denied");
  }

  const deleteTask = await Task.findByIdAndDelete(taskId);

  if (!deleteTask) {
    throw new ApiError(404, "Project does not exist");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Task deleted successfully"));
});

export const updateTaskDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const { title, description, status, priority, dueDate } = req.body;

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
          status: status || TaskStatusEnum.TODO,
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

    const project = await Project.findById(projectId);

    if (!project) {
      throw new ApiError(404, "Project ID is requied");

    }

    const isProjectMember = project.members.some(
      (id) => id.toString() === req.user._id.toString(),
    );

    if (!isProjectMember ) {
      throw new ApiError(400, "Access denied");
    }

    const tasks = await Task.aggregate([
      {
        $match: {
          projectId:new mongoose.Types.ObjectId(projectId),
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    return res
      .status(200)
      .json(new ApiResponse(200, tasks || [], "Tasks fetched successfully"));
  },
);
