import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "../../globals.css";
import { GalleryVerticalEndIcon } from "lucide-react";
import AuthInitializer from "@/app/AuthInitializer";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sign In | Planeflow",
  description: "Sign in to your Planeflow workspace to manage projects, tasks, and team collaboration.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>)
{

  return (
<div className="grid min-h-svh min-w-0 lg:grid-cols-2">
  <div className="flex min-w-0 flex-col gap-4 px-4 py-6 sm:px-6 md:p-10">
    <div className="flex min-w-0 justify-center gap-2 md:justify-start">
      <a
        href="/"
        className="flex min-w-0 items-center gap-2 font-medium"
      >
        <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <GalleryVerticalEndIcon className="size-4" />
        </div>

        <span className="truncate">Planeflow</span>
      </a>
    </div>

    <div className="flex min-w-0 flex-1 items-center justify-center">
      <div className="w-full min-w-0 max-w-sm">
        {children}
      </div>
    </div>
  </div>

  <div className="relative hidden min-w-0 bg-muted lg:block">
    <img
      src="https://picsum.photos/seed/projecthub-kanban/1000/1200"
      alt="Image"
      className="absolute inset-0 h-full w-full object-cover "
    />
  </div>
</div>
  );
}
