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
        await supabase.from("profiles").upsert({ id: user.id });
      }

      if (user) {
        const isNew = user.user_metadata?.is_new_user ?? false;
        router.replace(isNew ? "/onboarding" : "/voice");
      } else {
        router.replace("/login");
      }
    };

    handleRedirect();
  }, [router]);

  return (
    <Box sx={{ p: 4, textAlign: "center" }}>
      <CircularProgress />
      <Typography mt={2}>Verifying your account...</Typography>
    </Box>
  );
}
