"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Box, CircularProgress } from "@mui/material";
import { supabase } from "@/lib/supabaseClient";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  // ✅ Define protected routes here
  const protectedRoutes = ["/onboarding", "/voice"];

  useEffect(() => {
    async function checkAuth() {
      // Check if the current route requires authentication
      const isProtected = protectedRoutes.some((route) =>
        pathname.startsWith(route)
      );

      if (!isProtected) {
        // No need to check session for public routes
        setLoading(false);
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login");
      }

      setLoading(false);
    }

    checkAuth();
  }, [router, pathname]);

  if (loading) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Render children for both public and protected routes (once loading is done)
  return <>{children}</>;
}
