import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Team | Planeflow",
  description:
    "Manage your Planeflow team, collaborate with members, and organize project responsibilities.",
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
