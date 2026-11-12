"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Folder01Icon,
  Task01Icon,
  ViewIcon,
  Tick01Icon,
} from "@hugeicons/core-free-icons";
import { DashboardStats } from "@/app/(app)/dashboard/page";


const STAT_META = [
  { key: "totalProjects", title: "Total Projects", icon: Folder01Icon },
  { key: "totalTasks", title: "Total Task", icon: Task01Icon },
  { key: "inProgress", title: "In Progress", icon: ViewIcon },
  { key: "completedTasks", title: "Completed Tasks", icon: Tick01Icon },
] as const;

interface StatsCardsProps {
  stats: DashboardStats; 
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {STAT_META.map((meta) => {
        const data = stats[meta.key]; // { value, change } for this stat

        return (
          <div
            key={meta.key}
            className="rounded-xl border border-border bg-card p-4"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{meta.title}</p>
                <p className="text-2xl font-medium text-foreground">{data.value}</p>
                <p className="text-xs text-muted-foreground">
                  +{data.change} vs last month
                </p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-lg border border-border bg-muted shrink-0">
                <HugeiconsIcon icon={meta.icon} className="size-5 text-muted-foreground" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}