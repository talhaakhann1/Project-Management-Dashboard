import { Skeleton } from "@/components/ui/skeleton"

export function TasksListSkeleton() {
    return (
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 px-1">
                    <Skeleton className="size-4 rounded-sm" />
                    <Skeleton className="h-3 w-16" />
                </div>

                {Array.from({ length: 6 }).map((_, i) => (
                    <div
                        key={i}
                        className="flex items-start gap-3 rounded-lg border bg-card p-4"
                    >
                        <Skeleton className="mt-0.5 size-4 rounded-sm" />
                        <Skeleton className="mt-0.5 size-5 shrink-0 rounded-full" />
                        <div className="flex min-w-0 flex-1 flex-col gap-2">
                            <Skeleton className="h-4 w-2/3" />
                            <Skeleton className="h-3 w-4/5" />
                            <div className="flex flex-wrap items-center gap-2">
                                <Skeleton className="size-2 rounded-full" />
                                <div className="flex -space-x-2">
                                    <Skeleton className="size-6 rounded-full border-2 border-background" />
                                    <Skeleton className="size-6 rounded-full border-2 border-background" />
                                </div>
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-5 w-16 rounded-full" />
                            </div>
                        </div>
                        <Skeleton className="size-9 rounded-md" />
                    </div>
                ))}

                {/* Pagination */}
                <div className="flex items-center justify-center gap-2 pt-4">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-16" />
                </div>
            </div>
    )
}
