"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";
import { Formik, Form, Field } from "formik";
import { LoginSchema } from "@/utils/validations/Auth";
import VoiceOrb from "@/components/Visualizer/VoiceOrb";

const useStyles = () => ({
  main: {
    p: 4,
    maxWidth: 400,
    backgroundColor: "white",
    borderTopLeftRadius: "20px",
    borderTopRightRadius: "20px",
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    boxShadow: 3,
    display: "flex",
    flexDirection: "column",
    alignItems: "start",
    justifyContent: "center",
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
  textField: {
    "& .MuiOutlinedInput-root": {
      borderRadius: "8px",
      "& fieldset": {
        borderColor: "#ccc",
      },
      "&:hover fieldset": {
        borderColor: "#6B4DE6",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#4F46E5",
        borderWidth: "2px",
      },
    },
    "& .MuiInputBase-input": {
      color: "black",
      fontSize: "14px",
      padding: "12px",
    },
    "& .MuiFormHelperText-root": {
      color: "#B11215",
      fontSize: "12px",
      marginLeft: "0",
    },
  },
  mainContainer: {
    height: "100vh",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "column",
  },
  orbBox: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    pt: "50px",
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
    <Box sx={sx.mainContainer}>
      <Box sx={sx.orbBox}>
        <VoiceOrb loading={false} marginBottom="0px" />
      </Box>
      <Box sx={sx.main}>
        {/* Header */}
        <Typography variant="h5" sx={sx.title}>
          Login
        </Typography>
        <Typography variant="body2" sx={sx.subtitle}>
          Apnay dost sai baat karne kai liye login kare
        </Typography>

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
                sx={sx.textField}
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
                sx={sx.textField}
              />

              {/* <Typography variant="body2" sx={sx.forgetText}>
                Forgot Password?
              </Typography> */}

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
    </Box>
  );
}
