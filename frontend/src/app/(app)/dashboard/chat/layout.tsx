import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile | Planeflow",
  description:
    "Manage your Planeflow profile, account information, and personal workspace preferences.",
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
