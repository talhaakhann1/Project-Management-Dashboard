"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { HugeiconsIcon } from "@hugeicons/react";
import { MoreVerticalIcon } from "@hugeicons/core-free-icons";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from "recharts";
import { api } from "@/lib/api";
import type { DashboardPerformanceData } from "@/types/dashboard.type";
import { Spinner } from "@/components/ui/spinner";
export const dashboardStats = {
  totalProjects: { value: 15, change: 5 },
  totalTasks: { value: 10, change: 2 },
  inReviews: { value: 23, change: 12 },
  completedTasks: { value: 50, change: 15 },
};

export const performanceScore = 86;
export const performanceChange = 15;

export const performanceChartData = [
  { day: "Mon", value: 78 },
  { day: "Tue", value: 82 },
  { day: "Wed", value: 92 },
  { day: "Thu", value: 85 },
  { day: "Fri", value: 88 },
  { day: "Sat", value: 80 },
].map((d, i, arr) => {
  const isMax = d.value === Math.max(...arr.map((x) => x.value));
  return { ...d, isHighlight: isMax };
});

export type ProjectStatus = "in_progress" | "completed" | "on_hold";

export interface TodayTask {
  id: string;
  name: string;
  projectId: string;
  projectName: string;
  projectColor: string;
  dueDate: string;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  status: ProjectStatus;
  progress: number;
  totalTasks: number;
  completedTasks: number;
  dueDate: string;
  ownerName: string;
  ownerAvatarSeed: string;
}

export const todayTasks: TodayTask[] = [
  {
    id: "1",
    name: "Prepare Q2 report",
    projectId: "p1",
    projectName: "Fintech Project",
    projectColor: "blue",
    dueDate: "12 Mar 2024",
  },
  {
    id: "2",
    name: "Review design mockups",
    projectId: "p2",
    projectName: "Design System",
    projectColor: "violet",
    dueDate: "14 Mar 2024",
  },
  {
    id: "3",
    name: "Update API documentation",
    projectId: "p3",
    projectName: "Backend API",
    projectColor: "cyan",
    dueDate: "15 Mar 2024",
  },
  {
    id: "4",
    name: "Fix login flow bug",
    projectId: "p1",
    projectName: "Fintech Project",
    projectColor: "blue",
    dueDate: "12 Mar 2024",
  },
  {
    id: "5",
    name: "Schedule team sync",
    projectId: "p4",
    projectName: "Marketing",
    projectColor: "pink",
    dueDate: "16 Mar 2024",
  },
];

const projectSeeds: Omit<Project, "id">[] = [
  { name: "Fintech Project", color: "blue", status: "in_progress", progress: 70, totalTasks: 20, completedTasks: 14, dueDate: "12 Mar 2024", ownerName: "Michael M.", ownerAvatarSeed: "michael" },
  { name: "Design System", color: "violet", status: "in_progress", progress: 45, totalTasks: 15, completedTasks: 7, dueDate: "20 Mar 2024", ownerName: "Sarah K.", ownerAvatarSeed: "sarah" },
  { name: "Backend API", color: "cyan", status: "completed", progress: 100, totalTasks: 12, completedTasks: 12, dueDate: "10 Mar 2024", ownerName: "James L.", ownerAvatarSeed: "james" },
  { name: "Marketing", color: "pink", status: "on_hold", progress: 30, totalTasks: 8, completedTasks: 2, dueDate: "25 Mar 2024", ownerName: "Emily R.", ownerAvatarSeed: "emily" },
  { name: "Mobile App", color: "amber", status: "in_progress", progress: 60, totalTasks: 25, completedTasks: 15, dueDate: "18 Mar 2024", ownerName: "David T.", ownerAvatarSeed: "david" },
  { name: "Brodo Redesign", color: "blue", status: "in_progress", progress: 55, totalTasks: 18, completedTasks: 10, dueDate: "22 Mar 2024", ownerName: "Alex P.", ownerAvatarSeed: "alex" },
  { name: "HR Setup", color: "violet", status: "completed", progress: 100, totalTasks: 10, completedTasks: 10, dueDate: "08 Mar 2024", ownerName: "Jordan L.", ownerAvatarSeed: "jordan" },
  { name: "Data Pipeline", color: "cyan", status: "in_progress", progress: 80, totalTasks: 14, completedTasks: 11, dueDate: "15 Mar 2024", ownerName: "Sam R.", ownerAvatarSeed: "sam" },
  { name: "Customer Portal", color: "pink", status: "on_hold", progress: 25, totalTasks: 22, completedTasks: 5, dueDate: "30 Mar 2024", ownerName: "Morgan K.", ownerAvatarSeed: "morgan" },
  { name: "API Gateway", color: "amber", status: "in_progress", progress: 90, totalTasks: 8, completedTasks: 7, dueDate: "14 Mar 2024", ownerName: "Casey M.", ownerAvatarSeed: "casey" },
  { name: "Dashboard v2", color: "blue", status: "in_progress", progress: 40, totalTasks: 30, completedTasks: 12, dueDate: "28 Mar 2024", ownerName: "Taylor W.", ownerAvatarSeed: "taylor" },
  { name: "Auth Service", color: "violet", status: "completed", progress: 100, totalTasks: 6, completedTasks: 6, dueDate: "05 Mar 2024", ownerName: "Riley B.", ownerAvatarSeed: "riley" },
  { name: "Email Campaign", color: "pink", status: "on_hold", progress: 15, totalTasks: 12, completedTasks: 2, dueDate: "02 Apr 2024", ownerName: "Quinn F.", ownerAvatarSeed: "quinn" },
  { name: "Docs Site", color: "cyan", status: "in_progress", progress: 65, totalTasks: 16, completedTasks: 10, dueDate: "19 Mar 2024", ownerName: "Avery S.", ownerAvatarSeed: "avery" },
  { name: "Payment Flow", color: "amber", status: "in_progress", progress: 75, totalTasks: 11, completedTasks: 8, dueDate: "21 Mar 2024", ownerName: "Reese N.", ownerAvatarSeed: "reese" },
  { name: "Onboarding", color: "blue", status: "completed", progress: 100, totalTasks: 9, completedTasks: 9, dueDate: "11 Mar 2024", ownerName: "Parker D.", ownerAvatarSeed: "parker" },
  { name: "Analytics", color: "violet", status: "in_progress", progress: 50, totalTasks: 20, completedTasks: 10, dueDate: "24 Mar 2024", ownerName: "Drew H.", ownerAvatarSeed: "drew" },
  { name: "Notifications", color: "cyan", status: "on_hold", progress: 35, totalTasks: 7, completedTasks: 2, dueDate: "05 Apr 2024", ownerName: "Blake J.", ownerAvatarSeed: "blake" },
  { name: "Search Index", color: "pink", status: "in_progress", progress: 85, totalTasks: 13, completedTasks: 11, dueDate: "16 Mar 2024", ownerName: "Cameron T.", ownerAvatarSeed: "cameron" },
  { name: "Reporting", color: "amber", status: "completed", progress: 100, totalTasks: 15, completedTasks: 15, dueDate: "09 Mar 2024", ownerName: "Jamie V.", ownerAvatarSeed: "jamie" },
];

export const projects: Project[] = projectSeeds.map((p, i) => ({ ...p, id: `p${i + 1}` }));

export const welcomeSummary = {
  userName: "LN",
  tasksDueToday: 4,
  overdueTasks: 2,
  upcomingDeadlines: 8,
};

export const lastUpdated = "12 May 2025";

type ChartType = "bar" | "line";
type Period = "7d" | "30d";

const barColors = [
  "var(--muted-foreground)",
  "var(--muted-foreground)",
  "var(--foreground)",
  "var(--muted-foreground)",
  "var(--muted-foreground)",
  "var(--muted-foreground)",
];

const chartConfig = {
  value: {
    label: "Performance",
  },
};

export function PerformanceChart() {
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [period, setPeriod] = useState<Period>("7d");
  const [showGrid, setShowGrid] = useState(true);
  const [smoothCurve, setSmoothCurve] = useState(true);

  // Performance API state
  const [performanceData, setPerformanceData] = useState<DashboardPerformanceData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPerformance = useCallback(async (selectedPeriod: Period) => {
    let active = true;
    setIsLoading(true);
    setError(null);

    try {
      const data = await api.getDashboardPerformance(selectedPeriod);
      if (active && data) {
        setPerformanceData(data);
      }
    } catch (err: unknown) {
      if (active) {
        const errorMsg =
          err && typeof err === "object" && "response" in err
            ? ((err as { response?: { data?: { message?: string } } }).response?.data?.message ??
              "Failed to load performance data")
            : "Failed to load performance data";
        setError(errorMsg);
      }
    } finally {
      if (active) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await api.getDashboardPerformance(period);
        if (!cancelled && data) {
          setPerformanceData(data);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const errorMsg =
            err && typeof err === "object" && "response" in err
              ? ((err as { response?: { data?: { message?: string } } }).response?.data?.message ??
                "Failed to load performance data")
              : "Failed to load performance data";
          setError(errorMsg);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [period]);

  const resetToDefault = () => {
    setChartType("bar");
    setPeriod("7d");
    setShowGrid(true);
    setSmoothCurve(true);
  };

  // Derive dynamic chart values from API or empty fallback
  const rawChartData = performanceData?.chartData || [];
  const maxVal = rawChartData.length > 0 ? Math.max(...rawChartData.map((x) => x.value)) : 0;
  const data = rawChartData.map((d) => ({
    ...d,
    isHighlight: maxVal > 0 && d.value === maxVal,
  }));

  const score = performanceData?.score ?? 0;
  const change = performanceData?.change ?? 0;
  const periodLabel = period === "7d" ? "vs last Week" : "vs last Month";
  const changeSign = change > 0 ? `+${change}` : `${change}`;

  const hasEmptyData = !isLoading && !error && (!rawChartData.length || rawChartData.every((d) => d.value === 0));

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-base">Performance</h3>
          {isLoading && <Spinner className="size-3.5 text-muted-foreground animate-spin" />}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" className="size-8">
                <HugeiconsIcon icon={MoreVerticalIcon} className="size-4" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Chart Type</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => setChartType("bar")}>
                  Bar Chart {chartType === "bar" && "✓"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setChartType("line")}>
                  Line Chart {chartType === "line" && "✓"}
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Time Period</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => setPeriod("7d")}>
                  Last 7 days {period === "7d" && "✓"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPeriod("30d")}>
                  Last 30 days {period === "30d" && "✓"}
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={showGrid}
              onCheckedChange={(value) => setShowGrid(!!value)}
            >
              Show Grid
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={smoothCurve}
              onCheckedChange={(value) => setSmoothCurve(!!value)}
              disabled={chartType === "bar"}
            >
              Smooth Curve
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={resetToDefault}>
              Reset to Default
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="p-4">
        {error ? (
          <div className="h-[215px] flex flex-col items-center justify-center gap-2 text-center p-4">
            <p className="text-xs text-destructive">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => fetchPerformance(period)}
            >
              Retry
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-3xl font-semibold">{score}%</span>
              <span className="text-sm text-muted-foreground">
                {changeSign}% {periodLabel}
              </span>
            </div>

            {hasEmptyData ? (
              <div className="h-[175px] w-full flex flex-col items-center justify-center text-center p-4 border border-dashed rounded-lg bg-muted/20">
                <p className="text-xs font-medium text-muted-foreground">
                  No completed task activity in this period
                </p>
                <span className="text-[11px] text-muted-foreground/70 mt-1">
                  Complete tasks to see your daily performance score
                </span>
              </div>
            ) : (
              <ChartContainer config={chartConfig} className="h-[175px] w-full">
                {chartType === "bar" ? (
                  <BarChart
                    data={data}
                    margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
                  >
                    {showGrid && (
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--border)"
                        vertical={false}
                      />
                    )}
                    <XAxis
                      dataKey="day"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis hide domain={[0, 100]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} strokeWidth={0}>
                      {data.map((entry) => (
                        <Cell
                          key={entry.day + entry.date}
                          fill={entry.isHighlight ? "var(--foreground)" : "var(--muted-foreground)"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                ) : (
                  <LineChart
                    data={data}
                    margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
                  >
                    {showGrid && (
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--border)"
                        vertical={false}
                      />
                    )}
                    <XAxis
                      dataKey="day"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis hide domain={[0, 100]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type={smoothCurve ? "monotone" : "linear"}
                      dataKey="value"
                      stroke="var(--foreground)"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{
                        r: 6,
                        fill: "var(--foreground)",
                        stroke: "var(--card)",
                        strokeWidth: 2,
                      }}
                    />
                  </LineChart>
                )}
              </ChartContainer>
            )}
          </>
        )}
      </div>
    </div>
  );
}
