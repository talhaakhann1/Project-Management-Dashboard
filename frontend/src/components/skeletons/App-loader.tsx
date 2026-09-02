import { Loader2 } from "lucide-react"

export function AppLoader() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-background">
      <Loader2 className="size-5 animate-spin text-muted-foreground" />
    </div>
  );
}