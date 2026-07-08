import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import type { Request, Response } from "express";
import { Project } from "../models/project.model.js";
import mongoose from "mongoose";

export const createProject = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, colour, members } = req.body;
  const userId=req.user._id
  const existedProject = await Project.findOne({
    name,
  });
  if (existedProject) {
    throw new ApiError(409, "Project with this name already exist");
  }

  const allMembers = [...new Set([userId.toString(), ...members])];

  const createdProject = await Project.create({
    name,
    description,
    colour,
    createdBy:userId,
    members:allMembers,
  });
  if (!createdProject) {
    throw new ApiError(500, "Something went wrong while creating new project");
  }
  return res
    .status(201)
    .json(
      new ApiResponse(201, createProject, "Successfully created new project"),
    );
});

export const getAllProjects = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user._id;
  const existedUser = await User.findById(userId);
  if (!existedUser) {
    throw new ApiError(404, "User does not exist");
  }
  const project = await Project.aggregate([
    {
      $match: {
        members: new mongoose.Types.ObjectId(userId),
      },
    },
    { $sort: { createdAt: -1 } },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, project || [], "Projects fetched successfully"));
});

export const deleteProjectById = asyncHandler(async (req: Request, res: Response) => {
  const { projectId } = req.params;

  if (!projectId) {
    throw new ApiError(400, "Project ID is required");
  }

  const project = await Project.findOne({
    _id: projectId,
    members: req.user._id,
  });

  if (!project) {
    throw new ApiError(404, "Task not found or access denied");
  }
  const deleteProject = await Project.findByIdAndDelete(projectId);
  if (!deleteProject) {
    throw new ApiError(404, "Project does not exist");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Project deleted successfully"));
});

export const updatedProjectDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, description, colour } = req.body;
    const { projectId } = req.params;
    if (!projectId) {
      throw new ApiError(400, "Project ID is required");
    }
    const project = await Project.findOne({
      _id: projectId,
      members: req.user._id,
    });

    if (!project) {
      throw new ApiError(404, "Project not found or access denied");
    }
    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      {
        $set: {
          name,
          description,
          colour,
        },
      },
      {
        new: true,
      },
    );
    if (!updatedProject) {
      throw new ApiError(400, "Project does not exist");
    }
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedProject,
          "Updated project details successfully",
        ),
      );
  },
);

export const getProjectById = asyncHandler(async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const existedProject = await Project.findById(projectId);
  if (!existedProject) {
    throw new ApiError(404, "Project does not exist");
  }
  const project = await Project.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(existedProject._id),
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, project || [], "Project fetched successfully"));
});
