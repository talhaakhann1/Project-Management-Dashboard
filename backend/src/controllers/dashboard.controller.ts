import type { Request, Response } from "express";
import { Task } from "../models/task.model.js";
import { Project } from "../models/project.model.js";
import { TaskStatusEnum } from "../types/enums/task.enum.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

function getPercentChange(current: number, previous: number): number {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }
  const change = ((current - previous) / previous) * 100;
  return Math.round(change);
}

export const getDashboardStats = asyncHandler(
  async (req: Request, res: Response) => {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const taskStats = await Task.aggregate([
      {
        $facet: {
          totalTasksNow: [{ $count: "count" }],

          totalTasksPrevious: [
            { $match: { createdAt: { $lt: startOfThisMonth } } },
            { $count: "count" },
          ],

          inProgressNow: [
            { $match: { status: TaskStatusEnum.IN_PROGRESS } },
            { $count: "count" },
          ],
          inProgressPrevious: [
            {
              $match: {
                status: TaskStatusEnum.IN_PROGRESS,
                createdAt: { $lt: startOfThisMonth },
              },
            },
            { $count: "count" },
          ],

          completedNow: [
            { $match: { status: TaskStatusEnum.DONE } },
            { $count: "count" },
          ],
          completedPrevious: [
            {
              $match: {
                status: TaskStatusEnum.DONE,
                createdAt: { $lt: startOfThisMonth },
              },
            },
            { $count: "count" },
          ],
        },
      },
    ]);

    const extractCount = (bucket: { count: number }[]) => bucket[0]?.count ?? 0;

    const totalTasksNow = extractCount(taskStats[0].totalTasksNow);
    const totalTasksPrevious = extractCount(taskStats[0].totalTasksPrevious);
    const inProgressNow = extractCount(taskStats[0].inProgressNow);
    const inProgressPrevious = extractCount(taskStats[0].inProgressPrevious);
    const completedNow = extractCount(taskStats[0].completedNow);
    const completedPrevious = extractCount(taskStats[0].completedPrevious);

    const projectStats = await Project.aggregate([
      {
        $facet: {
          totalProjectsNow: [{ $count: "count" }],
          totalProjectsPrevious: [
            { $match: { createdAt: { $lt: startOfThisMonth } } },
            { $count: "count" },
          ],
        },
      },
    ]);

    const totalProjectsNow = extractCount(projectStats[0].totalProjectsNow);
    const totalProjectsPrevious = extractCount(
      projectStats[0].totalProjectsPrevious,
    );

    const dashboardStats = {
      totalProjects: {
        value: totalProjectsNow,
        change: getPercentChange(totalProjectsNow, totalProjectsPrevious),
      },
      totalTasks: {
        value: totalTasksNow,
        change: getPercentChange(totalTasksNow, totalTasksPrevious),
      },
      inProgress: {
        value: inProgressNow,
        change: getPercentChange(inProgressNow, inProgressPrevious),
      },
      completedTasks: {
        value: completedNow,
        change: getPercentChange(completedNow, completedPrevious),
      },
    };

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          dashboardStats,
          "Successfully fetch dashboard stats",
        ),
      );
  },
);

export const getTodayTasks = asyncHandler(
  async (req: Request, res: Response) => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const userId = req.user._id;
    const todayTasks = await Task.aggregate([
      {
        $match: {
          assignees: new mongoose.Types.ObjectId(userId),
          dueDate: { $gte: startOfToday, $lte: endOfToday },
        },
      },
      {
        $lookup: {
          from: "projects",
          localField: "projectId",
          foreignField: "_id",
          as: "project",
        },
      },

      { $unwind: "$project" },

      {
        $project: {
          _id: 0,
          title: 1,
          id: { $toString: "$_id" },
          projectId: { $toString: "$project._id" },
          projectName: "$project.name",
          projectColor: "$project.color",
          dueDate: 1,
        },
      },
    ]);

    return res
      .status(200)
      .json(new ApiResponse(200, todayTasks, "Successfully fetch today-tasks"));
  },
);

export const getWelcomeSummary = asyncHandler(
  async (req: Request, res: Response) => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const in7Days = new Date();
    in7Days.setDate(in7Days.getDate() + 7);

    const result = await Task.aggregate([
      {
        $facet: {
          tasksDueToday: [
            {
              $match: {
                dueDate: { $gte: startOfToday, $lte: endOfToday },
              },
            },
            { $count: "count" },
          ],

          overdueTasks: [
            {
              $match: {
                dueDate: { $lt: startOfToday },
                status: { $ne: TaskStatusEnum.DONE },
              },
            },
            { $count: "count" },
          ],

          upcomingDeadlines: [
            {
              $match: {
                dueDate: { $gt: endOfToday, $lte: in7Days },
              },
            },
            { $count: "count" },
          ],
        },
      },
    ]);

    const extractCount = (bucket: { count: number }[]) => bucket[0]?.count ?? 0;

    const welcomeSummary = {
      tasksDueToday: extractCount(result[0].tasksDueToday),
      overdueTasks: extractCount(result[0].overdueTasks),
      upcomingDeadlines: extractCount(result[0].upcomingDeadlines),
    };

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          welcomeSummary,
          "Successfully fetch welcome summary",
        ),
      );
  },
);

export const getAllProjects = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user._id;
    const projects = await Project.aggregate([
      {
        $match: {
          members: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "tasks",
          localField: "_id",
          foreignField: "projectId",
          as: "tasks",
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
        $unwind: { path: "$createdBy", preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          _id: 0,
          id: { $toString: "$_id" },
          name: 1,
          colour: 1,
          status: 1,
          totalTasks: { $size: "$tasks" },
          completedTasks: {
            $size: {
              $filter: {
                input: "$tasks",
                as: "task",
                cond: { $eq: ["$$task.status", "done"] },
              },
            },
          },
          dueDate: 1,
          createdBy: 1,
        },
      },
    ]);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          projects || [],
          "Successfully fetched all projects for dashboard",
        ),
      );
  },
);
