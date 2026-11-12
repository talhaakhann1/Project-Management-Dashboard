import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "../../globals.css";
import { Send } from "lucide-react";

export const metadata: Metadata = {
  title: "Sign In | Planeflow",
  description: "Sign in to your Planeflow workspace to manage projects, tasks, and team collaboration.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
   <div className="grid min-h-svh lg:grid-cols-2">

  {/* ── Left: Form panel ── */}
  <div className="flex flex-col px-4 py-6 sm:px-6 md:p-10">

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

  {/* ── Right: Image panel ── */}
  <div className="relative hidden bg-muted lg:block">
    <img
      src="https://picsum.photos/seed/projecthub-kanban/1000/1200"
      alt=""
      className="absolute inset-0 h-full w-full object-cover"
    />
  </div>

</div>
  );
}
