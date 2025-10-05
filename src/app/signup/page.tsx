"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";
import { Formik, Form, Field } from "formik";
import { SignupSchema } from "@/utils/validations/Auth";
import Link from "next/link";
import VoiceOrb from "@/components/Visualizer/VoiceOrb";
import { useRouter } from "next/navigation";

const makeStyles = () => ({
  main: {
    p: 4,
    maxWidth: 400,
    mx: "auto",
    backgroundColor: "white",
    borderTopLeftRadius: "20px",
    borderTopRightRadius: "20px",
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    boxShadow: 3,
    display: "flex",
    flexDirection: "column",
    alignItems: "start",
  },
  title: {
    mb: 1,
    fontWeight: 700,
    textAlign: "center",
  },
  subtitle: {
    mb: 3,
    color: "text.secondary",
    textAlign: "center",
  },
  socialButton: {
    mb: 1.5,
    textTransform: "none",
    borderColor: "#E0E0E0",
    color: "#000",
    fontWeight: 500,
    backgroundColor: "#fff",
    "&:hover": { backgroundColor: "#f9f9f9" },
  },
  googleButton: {
    mb: 2,
    textTransform: "none",
    borderColor: "#E0E0E0",
    color: "#000",
    fontWeight: 500,
    backgroundColor: "#fff",
    "&:hover": { backgroundColor: "#f9f9f9" },
  },
  dividerContainer: {
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
  forgetPassword: {
    textAlign: "right",
    mt: 1,
    color: "text.secondary",
    cursor: "pointer",
    "&:hover": { textDecoration: "underline" },
  },
  getStartedButton: {
    mt: 3,
    py: 1.2,
    backgroundColor: "#000",
    textTransform: "none",
    fontWeight: 600,
    borderRadius: "8px",
    "&:hover": { backgroundColor: "#333" },
  },
  newAccountText: {
    textAlign: "center",
    mt: 2,
    color: "text.secondary",
  },
  createAccountLink: {
    cursor: "pointer",
    fontWeight: 500,
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
});

export default function SignupPage() {
  const router = useRouter();
  const sx = makeStyles();
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ✅ Signup Handler (unchanged)
  const handleSignup = async (values: any) => {
    setFormError(null);
    setFormMessage(null);
    setLoading(true);

    try {
      const { email, password } = values;
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
          data: {
            is_new_user: true,
            is_onboarding_done: false,
            onboarding_questions: false,
          },
        },
      });

      if (signUpError) throw signUpError;

      const user = data.user;
      if (user) {
        const { error: insertError } = await supabase.from("profiles").insert([
          {
            id: user.id,
            email,
            is_first_login: true,
          },
        ]);

        if (insertError) throw insertError;
      }

      setFormMessage(
        "Signup successful! Please check your inbox and verify your email to activate your account."
      );
      router.push("/onboarding");
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
          Sign Up
        </Typography>
        <Typography variant="body2" sx={sx.subtitle}>
          Apnay dost sai milne kai liye, account banai
        </Typography>

        {/* Form */}
        <Formik
          initialValues={{
            email: "",
            password: "",
            phone: "",
            gender: "",
          }}
          validationSchema={SignupSchema}
          onSubmit={handleSignup}
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

              {/* <Typography variant="body2" sx={sx.forgetPassword}>
                Forget Password?
              </Typography> */}

              {formError && (
                <Typography color="error" mt={2}>
                  {formError}
                </Typography>
              )}
              {formMessage && (
                <Typography color="primary" mt={2}>
                  {formMessage}
                </Typography>
              )}

              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={sx.getStartedButton}
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Get Started"
                )}
              </Button>

              <Typography variant="body2" sx={sx.newAccountText}>
                Already have an account?{" "}
                <Link
                  color="primary"
                  style={sx.createAccountLink}
                  href="/login"
                >
                  Log In.
                </Link>
              </Typography>
            </Form>
          )}
        </Formik>
      </Box>
    </Box>
  );
}
