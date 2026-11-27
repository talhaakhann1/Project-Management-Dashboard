import type { Request, Response } from "express";
import { Task } from "../models/task.model.js";
import { Project } from "../models/project.model.js";
import { TaskStatusEnum } from "../types/enums/task.enum.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import redisClient from "../config/redis.js";

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

    const userId=req.user._id

    const cacheKey=`dashboard:stats:${userId}`

    const cacheDashboardStats=await redisClient.get(cacheKey)

    if(cacheDashboardStats){
      return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          JSON.parse(cacheDashboardStats),
          "Successfully fetch dashboard stats",
        ),
      );
    }

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

    if(dashboardStats){
      await redisClient.setEx(
        cacheKey,
        60,
        JSON.stringify(dashboardStats)
      )
    }
    

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

    const cacheKey=`today-tasks:${userId}`

    const cacheTodayTasks=await redisClient.get(cacheKey)

    if(cacheTodayTasks){
      return res
      .status(200)
      .json(new ApiResponse(200, JSON.parse(cacheTodayTasks), "Successfully fetch today-tasks"));
    }
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

    await redisClient.setEx(
      cacheKey,
      60,
      JSON.stringify(todayTasks)
    )

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

    const userId=req.user._id

    const cacheKey=`welcomeSummary:${userId}`

    const cacheWelcomeSummary=await redisClient.get(cacheKey)

    if(cacheWelcomeSummary){
      return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          JSON.parse(cacheWelcomeSummary),
          "Successfully fetch welcome summary",
        ),
      );
    }

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

    await redisClient.setEx(
      cacheKey,
      60,
      JSON.stringify(welcomeSummary)
    )

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

    const cachekey=`dashboard:projects:${userId}`

    const cacheProjects=await redisClient.get(cachekey)

    if(cacheProjects){
      return res
      .status(200)
      .json(
        new ApiResponse(
          200,
           JSON.parse(cacheProjects),
          "Successfully fetched all projects for dashboard",
        ),
      );
    }

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

    if(projects){
      await redisClient.setEx(
        cachekey,
        60,
        JSON.stringify(projects)
      )
    }


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

export const getDashboardPerformance = asyncHandler(
  async (req: Request, res: Response) => {
    const { period = "7d" } = req.query;

    if (period !== "7d" && period !== "30d") {
      throw new ApiError(400, "Invalid period. Period must be '7d' or '30d'");
    }

    const userId = req.user._id;
    const cacheKey = `dashboard:performance:${userId}:${period}`;

    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return res
          .status(200)
          .json(
            new ApiResponse(
              200,
              JSON.parse(cached),
              "Successfully fetched dashboard performance data",
            ),
          );
      }
    } catch {
      // Redis error fallback: continue without cache
    }

    const numDays = period === "7d" ? 7 : 30;
    const now = new Date();

    const currentEnd = new Date(now);
    currentEnd.setHours(23, 59, 59, 999);

    const currentStart = new Date(now);
    currentStart.setDate(currentStart.getDate() - (numDays - 1));
    currentStart.setHours(0, 0, 0, 0);

    const previousEnd = new Date(currentStart.getTime() - 1);
    const previousStart = new Date(previousEnd);
    previousStart.setDate(previousStart.getDate() - (numDays - 1));
    previousStart.setHours(0, 0, 0, 0);

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const statsResult = await Task.aggregate([
      {
        $match: {
          $or: [{ assignees: userObjectId }, { createdBy: userObjectId }],
        },
      },
      {
        $facet: {
          currentCompleted: [
            {
              $match: {
                status: TaskStatusEnum.DONE,
                updatedAt: { $gte: currentStart, $lte: currentEnd },
              },
            },
            { $count: "count" },
          ],
          currentTotal: [
            {
              $match: {
                createdAt: { $lte: currentEnd },
              },
            },
            { $count: "count" },
          ],
          previousCompleted: [
            {
              $match: {
                status: TaskStatusEnum.DONE,
                updatedAt: { $gte: previousStart, $lte: previousEnd },
              },
            },
            { $count: "count" },
          ],
          previousTotal: [
            {
              $match: {
                createdAt: { $lte: previousEnd },
              },
            },
            { $count: "count" },
          ],
          dailyCompleted: [
            {
              $match: {
                status: TaskStatusEnum.DONE,
                updatedAt: { $gte: currentStart, $lte: currentEnd },
              },
            },
            {
              $group: {
                _id: {
                  $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" },
                },
                completedCount: { $sum: 1 },
              },
            },
          ],
          dailyCreated: [
            {
              $match: {
                createdAt: { $lte: currentEnd },
              },
            },
            {
              $project: {
                createdDate: {
                  $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                },
              },
            },
          ],
        },
      },
    ]);

    const facet = statsResult[0] || {};
    const currentCompletedCount = facet.currentCompleted?.[0]?.count ?? 0;
    const currentTotalCount = facet.currentTotal?.[0]?.count ?? 0;
    const previousCompletedCount = facet.previousCompleted?.[0]?.count ?? 0;
    const previousTotalCount = facet.previousTotal?.[0]?.count ?? 0;

    const score =
      currentTotalCount > 0
        ? Math.round((currentCompletedCount / currentTotalCount) * 100)
        : 0;

    const previousScore =
      previousTotalCount > 0
        ? Math.round((previousCompletedCount / previousTotalCount) * 100)
        : 0;

    const change = score - previousScore;

    const dailyCompletedMap = new Map<string, number>();
    (facet.dailyCompleted || []).forEach(
      (item: { _id: string; completedCount: number }) => {
        dailyCompletedMap.set(item._id, item.completedCount);
      },
    );

    const allCreatedDates: string[] = (facet.dailyCreated || []).map(
      (item: { createdDate: string }) => item.createdDate,
    );

    const dayFormatter = new Intl.DateTimeFormat("en-US", { weekday: "short" });
    const chartData = [];

    for (let i = 0; i < numDays; i++) {
      const d = new Date(currentStart);
      d.setDate(d.getDate() + i);

      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const dayName = dayFormatter.format(d);

      const completedOnDay = dailyCompletedMap.get(dateStr) || 0;
      // Cumulative total tasks created up to this date
      const totalUpToDay = allCreatedDates.filter((cDate) => cDate <= dateStr)
        .length;

      const dayValue =
        totalUpToDay > 0
          ? Math.min(100, Math.round((completedOnDay / totalUpToDay) * 100))
          : 0;

      chartData.push({
        day: dayName,
        date: dateStr,
        value: dayValue,
      });
    }

    const performanceData = {
      score,
      change,
      period,
      chartData,
    };

    try {
      await redisClient.setEx(cacheKey, 60, JSON.stringify(performanceData));
    } catch {
      throw new ApiError(500, "Failed to cache dashboard performance data");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          performanceData,
          "Successfully fetched dashboard performance data",
        ),
      );
  },
);
