"use client"
import { DashboardContent } from "@/components/dashboard/content";
import api from "@/lib/axios";
import ApiResponse from "@/types/ApiResponse";
import { ProjectStatus } from "@/types/enums/project.enum";

import { AxiosError } from "axios";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";


export interface DashboardStats {
  totalProjects: { value: number, change: number, },
  totalTasks: { value: number, change: number, },
  inProgress: { value: number, change: number, },
  completedTasks: { value: number, change: number, },
};

export interface todayTasks {
  id: string,
  title: string,
  projectId: string,
  projectName: string,
  projectColor: string,
  dueDate: string,
}
export interface WelcomeSummary {
  tasksDueToday: number,
  overdueTasks: number,
  upcomingDeadlines: number
}

export interface dashboardProject {
  id: string;
  name: string;
  colour: string;
  status: ProjectStatus;
  totalTasks: number;
  completedTasks: number;
  dueDate: string;
  createdBy: {
    id: string,
    fullName: string,
    avatar: {
      url: string,
      localPath: string,
    },
  }
}

function handleApiError(error: unknown, fallbackTitle: string) {
  const axiosError = error as AxiosError<ApiResponse<unknown>>;
  const errorMessage = axiosError.response?.data?.message;
  console.log(errorMessage);
  toast(fallbackTitle, { description: errorMessage });
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [todayTasks, setTodayTasks] = useState<todayTasks[]>([]);
  const [projects, setProjects] = useState<dashboardProject[]>([])
  const [welcomeSummary, setWelcomeSummary] = useState<WelcomeSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  useEffect(() => {
    setIsLoading(true)
    const loadDashboard = async () => {
      try {
        console.time("stats-totalf");
        const [statsRes, tasksRes, summaryRes, projectRes] = await Promise.all([
          api.get("/api/dashboard/stats"),
          api.get("/api/dashboard/today-tasks"),
          api.get("/api/dashboard/welcome-summary"),
          api.get("/api/dashboard/projects")
        ])

        console.timeEnd("stats-totalf");

        setStats(statsRes.data.data);
        setTodayTasks(tasksRes.data.data);
        setWelcomeSummary(summaryRes.data.data);
        setProjects(projectRes.data.data);

      } catch (error) {
        handleApiError(error, "Failed to load dashboard");
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboard()
  }, [])

  return (

    <>
      <DashboardContent
        summary={welcomeSummary}
        isLoading={isLoading}
        stats={stats}
        tasks={todayTasks}
        projects={projects}
      />
    </>

  )
}
