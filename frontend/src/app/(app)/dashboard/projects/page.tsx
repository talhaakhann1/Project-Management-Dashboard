"use client"

import TeamProjects from "@/components/project/team-projects";
import { useCallback, useEffect, useState } from "react";
import api from "@/lib/axios";
import { Project } from "@/types/enums/project.enum";
import { toast } from "sonner";
import { AxiosError } from "axios";
import ApiResponse from "@/types/ApiResponse";
import { useAppSelector } from "@/store/hook";
import { ProjectsListSkeleton } from "@/components/skeletons/projects-list-skeleton";


function handleApiError(error: unknown, fallbackTitle: string) {
  const axiosError = error as AxiosError<ApiResponse<unknown>>;
  const errorMessage = axiosError.response?.data?.message;
  toast(fallbackTitle, { description: errorMessage });
}

export default function ProjectPage() {
  const [projects, setProjects] = useState<Project[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    if (!user || !user.id) {
      return;
    }


    const fetchProjects = async () => {
      setIsLoading(true)
      try {
        const response = await api.get("/api/projects")
        setProjects(response.data.data)

      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse<unknown>>
        const errorMessage = axiosError.response?.data?.message

        toast.error(errorMessage || "Failed to fetch all projects")
      } finally {
        setIsLoading(false)
      }
    };

    fetchProjects();

  }, [user]);


  const updatedProjectStatus = useCallback(async (projectId: string, status: string): Promise<void> => {
    try {
      const response = await api.patch(`/api/projects/s/${projectId}`, {
        projectStatus: status
      });
      setProjects((prev) =>
        prev.map((project) =>
          (project.id == projectId ? response.data.data : project)
        ))
      toast.message(response.data.message);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<unknown>>
      const errorMessage = axiosError.response?.data?.message

      toast.error(errorMessage || "Failed to update project status")
    }
  }, [])


  if (!user || !user.id) {
    return <div></div>;
  }


  return (
    <>
      <TeamProjects
        projects={projects}
        loading={isLoading}
        onUpdateStatus={updatedProjectStatus}
      />
    </>
  );
}