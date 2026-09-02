"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hook";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const { user, isLoggedIn } = useAppSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (!user || !isLoggedIn) {
      router.replace("/sign-in");
    }
  }, [user, isLoggedIn, router]);

  if (!user || !isLoggedIn) {
    return null;
  }

  return <>{children}</>;
}