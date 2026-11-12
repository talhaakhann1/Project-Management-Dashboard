import type { Metadata } from "next";
import "../../globals.css";
import { Send } from "lucide-react";

export const metadata: Metadata = {
  title: "Sign Up | Planeflow",
  description: "Create your Planeflow account and start planning, tracking, and shipping projects with your team.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <div className="grid min-h-svh lg:grid-cols-2">

  {/* ── Left: Image panel ── */}
  <div className="relative hidden bg-muted lg:block">
    <img
      src="https://picsum.photos/seed/projecthub-kanban/1200/1000"
      alt=""
      className="absolute inset-0 h-full w-full object-cover"
    />
  </div>

  {/* ── Right: Form panel ── */}
  <div className="flex flex-col p-6 md:p-10">

    {/* Logo */}
    <div className="flex justify-center md:justify-start">
      <a href="/" className="flex items-center gap-2 font-medium">
        <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary">
          <Send
            className="size-3.5 -rotate-12 text-primary-foreground"
            strokeWidth={2}
            aria-hidden="true"
          />
        </div>
        <span>Planeflow</span>
      </a>
    </div>

    {/* Form */}
    <div className="flex flex-1 items-center justify-center">
      <div className="w-full max-w-sm">
        {children}
      </div>
    </div>

  </div>

</div>

  );
}
