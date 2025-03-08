"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const pathname = usePathname();

  const publicPages = ["/login", "/"];
  const isPublicPage = publicPages.includes(pathname);

  if (isPublicPage || !user) {
    return <>{children}</>;
  }

  return <>{children}</>;
}
