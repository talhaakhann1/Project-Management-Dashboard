"use client";

import { useCallback, useEffect, useState} from "react";
import api from "@/lib/axios";
import { toast } from "sonner";
import { useParams, useRouter } from 'next/navigation'
import { AxiosError } from "axios";
import ApiResponse from "@/types/ApiResponse";
import { Project } from "@/types/enums/project.enum";
import ProjectDetail from "@/components/project/project-detail";


function ProjectIdPage() {
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const params = useParams()
  const router = useRouter()

  const projectId = params.projectId
  useEffect(() => {
    if (!projectId) return
    setIsLoading(true)
    const fetchProjectById = async () => {
      try {
        const response = await api.get(`/api/projects/${projectId}`)
        setProject(response.data.data)
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse<unknown>>;
        const errorMessage = axiosError.response?.data?.message;
        toast.error(errorMessage);
      } finally {
        setIsLoading(false)
      }
    }
    fetchProjectById()
  }, [projectId])

  const deleteProject = useCallback(async (projectId: string): Promise<void> => {
    try {
      const response = await api.delete(`/api/projects/${projectId}`);
      router.push("/dashboard/projects")
      toast.message(response.data.message);
    } catch (error) {
      const AxiosError = error as AxiosError<ApiResponse<unknown>>

      let errorMessage = AxiosError.response?.data.message

      toast.error(errorMessage || "Failed to delete the project")
    }
  }, []);

  // onUpdate: async (updates: any) => {
  //   /* update task */
  // },


  return (
    <ProjectDetail
      isLoading={isLoading}
      project={project}
      onDelete={deleteProject}
    />
  );
}

export default ProjectIdPage