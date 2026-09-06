import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tasks | Planeflow",
  description:
    "Manage, organize, and track your tasks, priorities, deadlines, and progress in Planeflow.",
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
