import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import type { Request, Response } from "express";
import { Project } from "../models/project.model.js";
import mongoose, { Types } from "mongoose";
import { ProjectStatus } from "../types/enums/project.enum.js";
import { Task } from "../models/task.model.js";

export const commonProjectAggregationStages = [
  {
    $lookup: {
      from: "users",
      localField: "members",
      foreignField: "_id",
      as: "members",
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
        { $project: { id: { $toString: "$_id" }, fullName: 1, avatar: 1 } },
      ],
    },
  },
  { $unwind: { path: "$createdBy", preserveNullAndEmptyArrays: true } },
  {
    $project: {
      _id: 0,
      id: { $toString: "$_id" },
      name: 1,
      description: 1,
      colour: 1,
      members: {
        $map: {
          input: "$members",
          as: "member",
          in: {
            id: "$$member.id",
            fullName: "$$member.fullName",
            avatar: "$$member.avatar",
          },
        },
      },
      status: 1,
      dueDate: 1,
      createdBy: 1,
    },
  },
];

export const createProject = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, description, colour, members, dueDate } = req.body;
    const userId = req.user._id;
    const existedProject = await Project.findOne({
      name,
    });
    if (existedProject) {
      throw new ApiError(409, "Project with this name already exist");
    }

    const allMembers = [...new Set([userId.toString(), ...members])];

    const project = await Project.create({
      name,
      description,
      status: ProjectStatus.ACTIVE,
      colour,
      dueDate,
      createdBy: userId,
      members: allMembers,
    });
    if (!project) {
      throw new ApiError(
        500,
        "Something went wrong while creating new project",
      );
    }

    const [createdProject] = await Project.aggregate([
      {
        $match: {
          _id: project._id,
        },
      },
      ...commonProjectAggregationStages,
    ]);
    if (!createdProject) {
      throw new ApiError(500, "Failed to fetch newly created project");
    }

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          createdProject,
          "Successfully created new project",
        ),
      );
  },
);

export const getAllProjects = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user._id;
    const existedUser = await User.findById(userId);
    if (!existedUser) {
      throw new ApiError(404, "User does not exist");
    }
    const projects = await Project.aggregate([
      {
        $match: {
          members: new mongoose.Types.ObjectId(userId),
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "members",
          foreignField: "_id",
          as: "members",
          pipeline: [
            {
              $project: {
                _id: 1,
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
                _id: 1,
                fullName: 1,
                avatar: 1,
              },
            },
          ],
        },
      },

      {
        $project: {
          id: { $toString: "$_id" },
          _id: 0,
          name: 1,
          description: 1,
          colour: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          createdBy: 1,
          members: {
            $map: {
              input: "$members",
              as: "member",
              in: {
                id: { $toString: "$$member._id" },
                fullName: "$$member.fullName",
                avatar: "$$member.avatar",
              },
            },
          },
        },
      },

      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);
    return res
      .status(200)
      .json(
        new ApiResponse(200, projects || [], "Projects fetched successfully"),
      );
  },
);

export const deleteProjectById = asyncHandler(
  async (req: Request, res: Response) => {
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

    if (!project.createdBy.equals(req.user._id)) {
      throw new ApiError(409, "Access denied");
    }

    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      await Task.deleteMany({ projectId: project._id }, { session });
      await Project.findByIdAndDelete(projectId, { session });

      await session.commitTransaction();
    } catch (err) {
      await session.abortTransaction();
      throw new ApiError(500, "Failed to delete project and its tasks");
    } finally {
      session.endSession();
    }

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Project deleted successfully"));
  },
);

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

export const getProjectById = asyncHandler(
  async (req: Request, res: Response) => {
    const { projectId } = req.params;
    if (
      !projectId ||
      typeof projectId !== "string" ||
      !Types.ObjectId.isValid(projectId)
    ) {
      throw new ApiError(400, "Invalid task id");
    }
    const [project] = await Project.aggregate([
      {
        $match: {
          _id: new Types.ObjectId(projectId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "members",
          foreignField: "_id",
          as: "members",
          pipeline: [
            {
              $project: {
                _id: 0,
                id: { $toString: "$_id" },
                name: 1,
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
      { $unwind: { path: "$createdBy", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          id: { $toString: "$_id" },
          name: 1,
          description: 1,
          colour: 1,
          status: 1,
          members: {
            $map: {
              input: "$members",
              as: "member",
              in: {
                id: "$$member.id",
                fullName: "$$member.fullName",
                avatar: "$$member.avatar",
              },
            },
          },
          createdBy: 1,
          dueDate: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);
    if (!project) {
      throw new ApiError(404, "Project not found");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, project, "Successfully get projectById"));
  },
);

export const getAllAvailableProjects = asyncHandler(
  async (req: Request, res: Response) => {
    const projects = await Project.aggregate([
      {
        $match: {
          createdBy: req.user._id,
        },
      },
      {
        $project: {
          id: { $toString: "$_id" },
          _id: 0,
          name: 1,
        },
      },
    ]);
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          projects || [],
          "Successfuly fetch available projects",
        ),
      );
  },
);

export const changeProjectStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { projectStatus } = req.body;
    const { projectId } = req.params;

    const project = await Project.findByIdAndUpdate(
      projectId,
      {
        $set: {
          status: projectStatus,
        },
      },
      {
        new: true,
      },
    );
    if (!project) {
      throw new ApiError(400, "Project does not exist");
    }
    const [updatedProject] = await Project.aggregate([
      {
        $match: {
          _id: project._id,
        },
      },
      ...commonProjectAggregationStages,
    ]);
    if (!updatedProject) {
      throw new ApiError(500, "Failed to fetch newly updated project");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedProject,
          "Project status updated successfully",
        ),
      );
  },
);
