"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Box, CircularProgress, Typography } from "@mui/material";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleRedirect = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;

      if (user) {
        // ✅ Step 1: Ensure profile record exists or is updated
        await supabase
          .from("profiles")
          .upsert({ id: user.id, email: user.email });

        const isOnboardingDone =
          user.user_metadata?.is_onboarding_done ?? false;

        // ✅ Step 2: If user is new, mark them as not new anymore
        if (isOnboardingDone) {
          await supabase.auth.updateUser({
            data: { is_new_user: false },
          });
        }

        // ✅ Step 3: Redirect based on new user status
        router.replace(!isOnboardingDone ? "/onboarding" : "/voice");
      } else {
        router.replace("/login");
      }
    };

    handleRedirect();
  }, [router]);

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      <CircularProgress />
      <Typography mt={2} variant="body1">
        Verifying your account...
      </Typography>
    </Box>
  );
}
