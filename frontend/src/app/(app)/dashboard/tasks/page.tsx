"use client"
import React, { useCallback, useEffect, useState } from 'react'
import TaskList from '@/components/task/task-list';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import ApiResponse from '@/types/ApiResponse';
import { Task, TaskStatus } from '@/types/task.type';
import { useAppSelector } from '@/store/hook';
import { TaskPriorityEnum, TaskStatusEnum } from '@/types/enums/task.enum';
import { TasksListSkeleton } from '@/components/skeletons/tasks-list-skeleton';

export interface CreateTask {
    title: string;
    description: string;
    status: TaskStatusEnum;
    priority: TaskPriorityEnum;
    assignees?: string[];
    dueDate?: string;
    tags?: string[];
    projectId?: string;
}


function handleApiError(error: unknown, fallbackTitle: string) {
    const axiosError = error as AxiosError<ApiResponse<unknown>>;
    const errorMessage = axiosError.response?.data?.message;
    console.log(errorMessage);
    toast(fallbackTitle, { description: errorMessage });
}

export function page() {
    const [tasks, setTasks] = useState<Task[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const user = useAppSelector((state) => state.auth.user);

    useEffect(() => {
        if (!user || !user.id) {
            return;
        }
    })

    const fetchAllTask = async () => {
        setIsLoading(true)
        try {
            const response = await api.get("/api/tasks")
            setTasks(response.data.data)

        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse<unknown>>
            const errorMessage = axiosError.response?.data?.message

            toast.error(errorMessage || "Failed to fetch all tasks")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchAllTask()
    }, [user])


    const updateTaskStatus = useCallback(async (taskId: string, status: TaskStatus): Promise<void> => {
        try {
            const response = await api.patch(`/api/tasks/s/${taskId}`, {
                taskStatus: status
            })
            setTasks((prev) => prev.map((task) => (
                taskId == task.id ? response.data.data : task
            )))
            toast.message(response.data.message)
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse<unknown>>
            const errorMessage = axiosError.response?.data?.message

            toast.error(errorMessage || "Failed to update task status")
        }
    }, [])


  
    return (
        <TaskList
            tasks={tasks}
            loading={isLoading}
            onTaskStatus={updateTaskStatus}
        />
    );


}

export default page

