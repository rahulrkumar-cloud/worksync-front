"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/TokenProvider";

const publicPaths = ["/login", "/signin"];

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If user is not authenticated and trying to access a protected route
    if (!isAuthenticated && !publicPaths.includes(pathname)) {
      router.replace("/login");
    }
  }, [isAuthenticated, pathname, router]);

  return <>{children}</>;
};
