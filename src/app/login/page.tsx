"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { TextField, Button, Box, Typography } from "@mui/material";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      return;
    }

    // Get user details
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Unable to fetch user details.");
      return;
    }

    if (!user.email_confirmed_at) {
      alert("Please verify your email before continuing.");
      return;
    }

    // Check if onboarding is complete
    const { data: profile } = await supabase
      .from("profiles")
      .select("has_onboarded")
      .eq("id", user.id)
      .single();

    // Redirect based on profile state
    if (profile?.has_onboarded) {
      window.location.href = "/voice";
    } else {
      window.location.href = "/onboarding";
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 10 }}>
      <Typography variant="h5" mb={3}>
        Sign In
      </Typography>
      <TextField
        fullWidth
        label="Email"
        margin="normal"
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        fullWidth
        label="Password"
        type="password"
        margin="normal"
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button
        fullWidth
        variant="contained"
        sx={{ mt: 2 }}
        onClick={handleLogin}
      >
        Login
      </Button>

      {error && (
        <Typography color="error" mt={2}>
          {error}
        </Typography>
      )}
    </Box>
  );
}
