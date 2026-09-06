"use client";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { HugeiconsIcon } from "@hugeicons/react";
import { Folder01Icon, Share01Icon, Github01Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";;
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThemeSwitch } from "../unlumen-ui/theme-switch";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";

const pages = [
  {
    title: "Dashboard",
    url: "/dashboard",
  },
  {
    title: "Projects",
    url: "/dashboard/projects",
  },
  {
    title: "Tasks",
    url: "/dashboard/tasks",
  },
  {
    title: "Team",
    url: "/dashboard/teams",
  },
  {
    title: "Profile",
    url: "/dashboard/profile",
  },
  {
    title: "Get Help",
    url: "#",

  },
]

export function DashboardHeader() {
  const [isSharing, setIsSharing] = useState(false);
  const pathname = usePathname()

  const currentPage = pages.find((page) =>
    page.url === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(page.url)
  )


  const handleShare = async () => {
    if (isSharing) return;

    const url = window.location.href;

    try {
      setIsSharing(true);

      if (navigator.share) {
        await navigator.share({
          title: "Planeflow Dashboard",
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Dashboard link copied!");
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Failed to share:", error);
      }
    } finally {
      setIsSharing(false);
    }
  };
  return (
    <header className="flex items-center justify-between gap-4 px-4 sm:px-6 py-3 border-b bg-card sticky top-0 z-10 w-full shrink-0">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="-ml-2" />
        <div className="flex items-center gap-2 text-muted-foreground">
          <HugeiconsIcon icon={Folder01Icon} className="size-4" />
          <span className="text-sm font-medium">{currentPage?.title ?? "Dashboard"}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5"
          onClick={handleShare}
          disabled={isSharing}
        >
          <HugeiconsIcon icon={Share01Icon} className="size-3.5" />

          <span className="hidden sm:inline">
            {isSharing ? "Sharing..." : "Share"}
          </span>
        </Button>
        <Link
          href="https://github.com/talhaakhann1"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "size-8")}
        >
          <HugeiconsIcon icon={Github01Icon} className="size-5" />
        </Link>
      </div>
    </header>
  );
}