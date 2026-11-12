"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../ui/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Separator } from "../ui/separator";
import { User } from "@/types/enums/user.enum";
import { User as UserIcon } from "lucide-react";
import { Skeleton } from "../ui/skeleton"



export interface TeamMemberListProps {
  members?: User[];
  currentUserId?: string;
  loading?: boolean;
  className?: string;
  showSearch?: boolean;
  showFilters?: boolean;
  showUsage?: boolean;
}

function formatDate(date: string | Date) {
  const parsedDate = new Date(date)

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsedDate)
}


function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function TeamMemberSkeleton() {
  return (
    <div>
      <div className="flex items-center gap-4 p-4">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex items-center gap-2">
            <Skeleton className="size-8 rounded-full" />

            <Skeleton className="h-4 w-28" />

            <Skeleton className="h-5 w-10 rounded-full" />
          </div>

          <Skeleton className="h-4 w-48" />

          <Skeleton className="h-3 w-24" />
        </div>
      </div>

      <Separator />
    </div>
  )
}

export function TeamMemberListSkeleton() {
  return (
    <div>
      {Array.from({ length: 5 }).map((_, index) => (
        <TeamMemberSkeleton key={index} />
      ))}
    </div>
  )
}

export default function TeamMemberList({
  members = [],
  loading,
  currentUserId,
  className,
  showSearch = true,
  showFilters = true,
  showUsage = false,
}: TeamMemberListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      !searchQuery.trim() ||
      member.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());

    // const matchesRole = roleFilter === "all" || member.role === roleFilter;
    // const matchesStatus =
    //   statusFilter === "all" || member.status === statusFilter;

    return matchesSearch;
  });

  console.log(loading);
  

  const handleAction = async (
    action: () => Promise<void>,
    memberId: string
  ) => {
    setActionLoading(memberId);
    try {
      await action();
    } finally {
      setActionLoading(null);
    }
  };

  return (
    // Drop-in replacement — preserves all props/logic, enhances visual design only.
// Assumes shadcn/ui primitives and Tailwind CSS (same deps as the original).

<div className="mx-auto flex w-full mt-5 mb-5 max-w-7xl flex-col gap-6 px-4 sm:px-6 lg:px-8">

  {/* ── Header ─────────────────────────────────────────────────── */}
  <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
    <div className="flex flex-col gap-0.5">
      <CardTitle className="text-2xl font-semibold tracking-tight">
        Team Members
      </CardTitle>
      <CardDescription className="text-sm text-muted-foreground">
        {members.length} member{members.length !== 1 ? "s" : ""} in your workspace
      </CardDescription>
    </div>
  </div>

  {/* ── Search ─────────────────────────────────────────────────── */}
  {showSearch && (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
        <svg
          className="size-4 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <InputGroupInput
        className="h-9 w-full rounded-md border bg-background pl-9 pr-4 text-sm shadow-none
                   placeholder:text-muted-foreground/60
                   focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none
                   sm:max-w-xs"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setSearchQuery(e.target.value)
        }
        placeholder="Search members…"
        type="search"
        value={searchQuery}
      />
    </div>
  )}

  {/* ── List ───────────────────────────────────────────────────── */}
  <CardContent className="p-0">
    {loading ? (
      <TeamMemberListSkeleton />
    ) : filteredMembers.length === 0 ? (
      /* ── Empty state ── */
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 py-16 text-center">
        <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted">
          <UserIcon className="size-5 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">
          {searchQuery || roleFilter !== "all" || statusFilter !== "all"
            ? "No members found"
            : "No members yet"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {searchQuery || roleFilter !== "all" || statusFilter !== "all"
            ? "Try adjusting your filters"
            : "Invite members to get started"}
        </p>
      </div>
    ) : (
      /* ── Member rows ── */
      <div className="overflow-hidden rounded-xl border bg-background shadow-sm">
        {filteredMembers.map((member, idx) => {
          const isCurrentUser = member.id === currentUserId;

          return (
            <div key={member.id}>
              <div className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/40">

                {/* Avatar */}
                <Avatar className="size-10 shrink-0 ring-2 ring-background">
                  <AvatarImage
                    alt={member.fullName}
                    src={member.avatar.url ?? ""}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                    {getInitials(member.fullName)}
                  </AvatarFallback>
                </Avatar>

                {/* Primary info */}
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium leading-none text-foreground truncate">
                      {member.fullName}
                    </span>

                    {isCurrentUser && (
                      <Badge
                        className="h-5 rounded-full px-2 text-[11px] font-medium
                                   bg-primary/10 text-primary border-transparent"
                        variant="secondary"
                      >
                        You
                      </Badge>
                    )}

                    {member.isActive && (
                      <Badge
                        className="h-5 rounded-full px-2 text-[11px] font-medium
                                   border-emerald-200 bg-emerald-50 text-emerald-700
                                   dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                        variant="outline"
                      >
                        <span className="mr-1 inline-block size-1.5 rounded-full bg-emerald-500" />
                        Active
                      </Badge>
                    )}
                  </div>

                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {member.email}
                  </p>
                </div>

                {/* Joined date — right-aligned, hidden on small screens */}
                <div className="hidden shrink-0 flex-col items-end gap-0.5 sm:flex">
                  <span className="text-xs text-muted-foreground/70">
                    Joined
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    {formatDate(member.createdAt)}
                  </span>
                </div>

              </div>

              {idx < filteredMembers.length - 1 && (
                <Separator className="ml-[72px]" />
              )}
            </div>
          );
        })}
      </div>
    )}
  </CardContent>

</div>
  );
}


