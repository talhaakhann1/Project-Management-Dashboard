"use client";

import TeamMemberList, { TeamMemberListSkeleton } from "@/components/team/team-member-list";
import api from "@/lib/axios";
import { useAppSelector } from "@/store/hook";
import ApiResponse from "@/types/ApiResponse";
import { User } from "@/types/enums/user.enum";
import { AxiosError } from "axios";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";


export default function TeamPage() {
  const [members, setMembers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const user=useAppSelector((state)=>state.auth.user)
  const userId=user?.id

  const fetchTeamMembers = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await api.get("/team-members")
      console.log(res.data.data);
      setMembers(res.data.data)
    } catch (error) {
      const AxiosError = error as AxiosError<ApiResponse<unknown>>
      let errorMessage = AxiosError.response?.data.message

      toast("Failed to get team members",
        {
          description: errorMessage
        })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
     if (!user || !user.id) {
      return;
    }
    fetchTeamMembers()
  }, [fetchTeamMembers])

   if (!user || !user.id) {
    return <div></div>;
  }

  return (
    <TeamMemberList
      members={members}
      currentUserId={userId}
      loading={isLoading}
    />
  );
}