import { Skeleton } from "@/components/ui/skeleton"

export function DashboardContentSkeleton() {
    return (
        <>

            {/* Dashboard Header */}
        

            {/* Stats Cards */}
            <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="rounded-lg border p-4 flex flex-col gap-2">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-7 w-20" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 sm:gap-6">
                {/* Today's Tasks */}
                <div className="lg:col-span-2 flex flex-col gap-3 rounded-lg border p-4">
                    <Skeleton className="h-5 w-32" />
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <Skeleton className="size-5 rounded-full" />
                            <Skeleton className="h-4 flex-1" />
                        </div>
                    ))}
                </div>

                {/* Performance Chart */}
                <div className="rounded-lg border p-4 flex flex-col gap-3">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-48 w-full" />
                </div>
            </div>

            {/* Projects Table */}
            <div className="flex flex-col gap-3 rounded-lg border p-4">
                <Skeleton className="h-5 w-32" />
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex gap-4">
                        <Skeleton className="h-4 flex-1" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                ))}
            </div>
        </>
    )
}

export function SummarySkeleton(){
    return (      
                <Skeleton className="h-5 w-120" />
    )
}
