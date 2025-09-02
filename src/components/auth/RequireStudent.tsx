"use client";

import * as React from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function RequireStudent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading) {
      if (!user) router.replace("/login");
      else if (!user.email?.endsWith("@student.unipu.hr")) router.replace("/");
    }
  }, [user, loading, router]);

  if (loading) return <div className="p-6 text-gray-600">Provjera pristupa…</div>;
  return <>{children}</>;
}
