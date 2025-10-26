
'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface AuthWrapperProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireRole?: "admin" | "empleado";
}

export function AuthWrapper({ 
  children, 
  requireAuth = true, 
  requireRole 
}: AuthWrapperProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (requireAuth && !session) {
      router.push("/login");
      return;
    }

    if (requireRole && session?.user?.role !== requireRole) {
      router.push("/");
      return;
    }
  }, [session, status, router, requireAuth, requireRole]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (requireAuth && !session) {
    return null;
  }

  if (requireRole && session?.user?.role !== requireRole) {
    return null;
  }

  return <>{children}</>;
}
