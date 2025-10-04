"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  TextField,
  Typography,
} from "@mui/material";
import { Formik, Form, Field } from "formik";
import FacebookIcon from "@mui/icons-material/Facebook";
import GoogleIcon from "@mui/icons-material/Google";
import { LoginSchema } from "@/utils/validations/Auth";

const useStyles = () => ({
  main: {
    p: 4,
    maxWidth: 380,
    mx: "auto",
    mt: 6,
    backgroundColor: "white",
    borderRadius: 3,
    boxShadow: 3,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  title: {
    fontWeight: 700,
    textAlign: "center",
    mb: 1,
  },
  subtitle: {
    color: "text.secondary",
    textAlign: "center",
    mb: 3,
  },
  socialBtn: {
    mb: 1.5,
    textTransform: "none",
    borderColor: "#E0E0E0",
    color: "#000",
    fontWeight: 500,
    backgroundColor: "#fff",
    "&:hover": { backgroundColor: "#f9f9f9" },
  },
  dividerBox: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    my: 2,
  },
  dividerText: {
    mx: 1,
    color: "text.secondary",
    fontWeight: 500,
  },
  forgetText: {
    textAlign: "right",
    mt: 1,
    color: "text.secondary",
    cursor: "pointer",
    "&:hover": { textDecoration: "underline" },
  },
  submitBtn: {
    mt: 3,
    py: 1.2,
    backgroundColor: "#000",
    textTransform: "none",
    fontWeight: 600,
    borderRadius: "8px",
    "&:hover": { backgroundColor: "#333" },
  },
  bottomText: {
    textAlign: "center",
    mt: 2,
    color: "text.secondary",
  },
  linkText: {
    cursor: "pointer",
    fontWeight: 500,
    color: "primary.main",
  },
});

export default function LoginPage() {
  const sx = useStyles();
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (values: any) => {
    setFormError(null);
    setLoading(true);

    try {
      const { email, password } = values;
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Unable to fetch user details.");
      if (!user.email_confirmed_at)
        throw new Error("Please verify your email before continuing.");

      router.replace(
        !user?.user_metadata?.is_onboarding_done ? "/onboarding" : "/voice"
      );
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={sx.main}>
      {/* Header */}
      <Typography variant="h5" sx={sx.title}>
        Welcome Back
      </Typography>
      <Typography variant="body2" sx={sx.subtitle}>
        Sign in to continue your journey
      </Typography>

      {/* Social Buttons */}
      <Button
        fullWidth
        variant="outlined"
        startIcon={<FacebookIcon sx={{ color: "#1877F2" }} />}
        sx={sx.socialBtn}
      >
        Continue with Facebook
      </Button>
      <Button
        fullWidth
        variant="outlined"
        startIcon={<GoogleIcon sx={{ color: "#DB4437" }} />}
        sx={{ ...sx.socialBtn, mb: 2 }}
      >
        Continue with Google
      </Button>

      {/* Divider */}
      <Box sx={sx.dividerBox}>
        <Divider sx={{ flexGrow: 1 }} />
        <Typography variant="body2" sx={sx.dividerText}>
          or
        </Typography>
        <Divider sx={{ flexGrow: 1 }} />
      </Box>

      {/* Formik Login Form */}
      <Formik
        initialValues={{ email: "", password: "" }}
        validationSchema={LoginSchema}
        onSubmit={handleLogin}
      >
        {({ errors, touched, handleChange }) => (
          <Form style={{ width: "100%" }}>
            <Field
              as={TextField}
              name="email"
              placeholder="Enter Your Email ID"
              fullWidth
              margin="normal"
              onChange={handleChange}
              error={touched.email && Boolean(errors.email)}
              helperText={touched.email && errors.email}
            />

            <Field
              as={TextField}
              name="password"
              placeholder="Password"
              type="password"
              fullWidth
              margin="normal"
              onChange={handleChange}
              error={touched.password && Boolean(errors.password)}
              helperText={touched.password && errors.password}
            />

            <Typography variant="body2" sx={sx.forgetText}>
              Forgot Password?
            </Typography>

            {formError && (
              <Typography color="error" mt={2}>
                {formError}
              </Typography>
            )}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={sx.submitBtn}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Login"
              )}
            </Button>

            <Typography variant="body2" sx={sx.bottomText}>
              Don’t have an account?{" "}
              <Typography
                component="span"
                sx={sx.linkText}
                onClick={() => router.push("/signup")}
              >
                Create one
              </Typography>
            </Typography>
          </Form>
        )}
      </Formik>
    </Box>
  );
}
