import { Skeleton } from "@/components/ui/skeleton"

export function ProjectsListSkeleton() {
    return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div
                        key={i}
                        className="flex flex-col justify-between gap-3 rounded-lg border bg-card p-4"
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                <Skeleton className="size-10 shrink-0 rounded-lg" />
                                <div className="flex min-w-0 flex-1 flex-col gap-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-5 w-16 rounded-full" />
                                </div>
                            </div>
                            <Skeleton className="size-6 shrink-0 rounded-md" />
                        </div>

                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-4/5" />

                        <div className="flex -space-x-2">
                            <Skeleton className="size-6 rounded-full border-2 border-background" />
                            <Skeleton className="size-6 rounded-full border-2 border-background" />
                            <Skeleton className="size-6 rounded-full border-2 border-background" />
                        </div>
                    </div>
                ))}
            </div>
    )
}
