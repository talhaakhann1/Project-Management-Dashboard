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
    <div className="mx-auto flex w-full mt-5 mb-5 max-w-7xl flex-col gap-4 px-4 sm:px-6 lg:px-8">
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <CardTitle className="text-xl font-semibold sm:text-2xl">
          Team Members
        </CardTitle>
        <CardDescription>
          {members.length} team member{members.length !== 1 ? "s" : ""}
        </CardDescription>
      </div>
      {showSearch && (
        <InputGroup>
          <InputGroupAddon>
            <svg
              className="size-4"
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
          </InputGroupAddon>
          <InputGroupInput
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchQuery(e.target.value)
            }
            placeholder="Search members…"
            type="search"
            value={searchQuery}
          />
        </InputGroup>
      )}
      <CardContent>
  {loading ? (
    <TeamMemberListSkeleton />
  ) : filteredMembers.length === 0 ? (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <UserIcon className="size-6" />
        </EmptyMedia>

        <EmptyTitle>
          {searchQuery || roleFilter !== "all" || statusFilter !== "all"
            ? "No members found"
            : "No members yet"}
        </EmptyTitle>

        <EmptyDescription>
          {searchQuery || roleFilter !== "all" || statusFilter !== "all"
            ? "Try adjusting your filters"
            : "Invite members to get started"}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  ) : (
    <div className="flex flex-col gap-0 overflow-hidden rounded-lg border">
      {filteredMembers.map((member, idx) => {
        const isCurrentUser = member.id === currentUserId;

        return (
          <div key={member.id}>
            <div key={member.id}>
                    <div className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/50">
                      <div className="flex min-w-0 flex-1 flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-2 font-medium text-sm">
                            {" "}
                            <Avatar className="size-8">
                              <AvatarImage
                                alt={member.fullName}
                                src={member.avatar.url ?? ""}
                              />
                              <AvatarFallback>
                                {getInitials(member.fullName)}
                              </AvatarFallback>
                            </Avatar>
                            {member.fullName}
                          </span>
                          {isCurrentUser && (
                            <Badge className="text-xs" variant="secondary">
                              You
                            </Badge>
                          )}
                          {member.isActive && (
                            <Badge className="text-xs" variant="outline">
                              Active
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground text-sm">
                          {member.email}
                        </p>
                        <div className="flex flex-wrap items-center gap-1 text-muted-foreground text-xs">
                          <span>Joined {formatDate(member.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    {idx < filteredMembers.length - 1 && <Separator />}
                  </div>
            {idx < filteredMembers.length - 1 && <Separator />}
          </div>
        );
      })}
    </div>
  )}
</CardContent>
    </div>
  );
}


