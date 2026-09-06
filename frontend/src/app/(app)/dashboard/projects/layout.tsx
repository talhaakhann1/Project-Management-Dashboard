import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects | Planeflow",
  description:
    "Create, manage, and track your Planeflow projects, milestones, progress, and team collaboration.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>)
{

  return (
    <>{children}</>
  )
}
