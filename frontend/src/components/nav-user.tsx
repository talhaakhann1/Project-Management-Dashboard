"use client"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import api from "@/lib/axios"
import { logout } from "@/store/authSlice"
import { useAppDispatch, useAppSelector } from "@/store/hook"
import ApiResponse from "@/types/ApiResponse"
import { AxiosError } from "axios"
import { EllipsisVerticalIcon, CircleUserRoundIcon, LogOutIcon, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { ProfileTriggerSkeleton } from "./skeletons/profile-trigger-skeleton"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
    accountSettingUrl: string,
    logoutUrl: string
  }
}) {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const { isMobile } = useSidebar()
  const dispatch = useAppDispatch()
  const authUser = useAppSelector((state) => state.auth.user)

  const router = useRouter()
  const logoutHandler = async () => {
    setIsSubmitting
    try {
      const response = await api.get("/api/auth/logout")
      console.log(response);

      dispatch(logout())
      router.replace("/")
      toast.message(response.data.message)
    } catch (error) {
      const AxiosError = error as AxiosError<ApiResponse<unknown>>
      let errorMessage = AxiosError.response?.data.message

      toast("Logout Failed",
        {
          description: errorMessage
        })
    } finally {
      setIsSubmitting(false)
    }
  }



  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton size="lg" className="aria-expanded:bg-muted" />
            }
          >
            {authUser && authUser._id ?
              (
                <>
                  <Avatar className="size-8 rounded-lg">
                    <AvatarImage src={authUser?.avatar.url} alt={authUser?.fullName} />
                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{authUser?.fullName}</span>
                    <span className="truncate text-xs text-foreground/70">
                      {authUser?.fullName}
                    </span>
                  </div>
                  <EllipsisVerticalIcon className="ml-auto size-4" />
                </>
              ) : (
                <ProfileTriggerSkeleton />
              )
            }
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="size-8">
                    <AvatarImage src={authUser?.avatar.url} alt={authUser?.fullName} />
                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{authUser?.fullName}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {authUser?.email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem render={<a href={user.accountSettingUrl} />} >
                <CircleUserRoundIcon
                />
                Profile
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logoutHandler()}>
              <LogOutIcon
              />
              {
                isSubmitting ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please wait
                  </>
                ) :
                  ("Log out")
              }
            </DropdownMenuItem>
          </DropdownMenuContent>

        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>

  )
}
