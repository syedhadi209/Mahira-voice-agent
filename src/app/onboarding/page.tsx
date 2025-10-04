"use client";

import { supabase } from "@/lib/supabaseClient";
import { Box, Button, CircularProgress } from "@mui/material";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const OnboardingPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const completeOnboarding = async () => {
    setLoading(true);
    try {
      await supabase.auth.updateUser({
        data: { is_new_user: false, is_onboarding_done: true },
      });
      router.push("/voice");
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Box
      sx={{
        height: "100vh",
        maxWidth: "375px",
        margin: "auto",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Button
        startIcon={
          loading && <CircularProgress size={18} sx={{ color: "black" }} />
        }
        sx={{ border: "1px solid black", color: "black" }}
        disabled={loading}
        onClick={() => completeOnboarding()}
      >
        Complete Onboarding
      </Button>
    </Box>
  );
};

export default OnboardingPage;
