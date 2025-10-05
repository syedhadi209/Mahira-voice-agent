"use client";

import VoiceOrb from "@/components/Visualizer/VoiceOrb";
import { supabase } from "@/lib/supabaseClient";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Image from "next/image";
import { interests, occupations } from "@/utils/constants/onboarding_data";
import { useSettings } from "@/context/SettingsContext";

const makeStyles = () => ({
  main: {
    height: "100vh",
    maxWidth: "375px",
    margin: "auto",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
  },
  stepOneBox: {
    position: "absolute",
    bottom: "150px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
    maxWidth: "200px",
    width: "100%",
  },
  heading: {
    fontSize: "32px",
    fontWeight: "700",
    letterSpacing: "0.36px",
    color: "#FFFFFF",
  },
  continueBtn: {
    background: "white",
    textTransform: "none",
    color: "black",
    width: "178px",
    borderRadius: "999px",
    height: "53px",
  },
  stepTwoBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "0 10px",
  },
  subHeading: {
    fontSize: "32px",
    fontWeight: "400",
    lineHeight: "28px",
    letterSpacing: "0.35px",
    color: "#FFFFFF",
    textAlign: "center",
  },
  textField: {
    mt: "30px",
    width: "100%",
    "& .MuiInputBase-input": {
      color: "white",
      fontSize: "20px",
      textAlign: "center",
    },
    color: "white",
    "& .MuiInput-underline:before": { borderBottomColor: "#FFFFFF" },
    "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
      borderBottomColor: "gray",
    },
    "& .MuiInput-underline:after": { borderBottomColor: "#FFFFFF" },
  },
  occupationBox: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    mt: "20px",
  },
  occupationBtn: {
    width: "346px",
    height: "45px",
    background: "white",
    textTransform: "capitalize",
    color: "#000000",
    fontSize: "16px",
    fontWeight: "500",
    letterSpacing: "0.18px",
    borderRadius: "8px",
  },
  chipsBox: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    justifyContent: "center",
    mt: "25px",
  },
  chip: (isSelected: boolean) => ({
    color: "black",
    backgroundColor: isSelected ? "#D9C8FB" : "white",
    border: "1px solid white",
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      backgroundColor: isSelected ? "#C4B1F5" : "#F3F3F3",
    },
    "&.Mui-focusVisible": {
      backgroundColor: isSelected ? "#D9C8FB" : "white",
    },
    "&:active": {
      backgroundColor: isSelected ? "#D9C8FB" : "white",
      boxShadow: "none",
    },
    "& .MuiChip-deleteIcon": {
      color: "black",
      "&:hover": {
        color: "red",
      },
    },
  }),
  backArrowBox: { position: "absolute", top: "23px", left: "21px" },
});

const OnboardingPage = () => {
  const sx = makeStyles();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const { setFromOnboardingScreen } = useSettings();

  // ✅ Initialize Formik
  const formik = useFormik({
    initialValues: {
      name: "",
      occupation: "",
      interests: [] as string[],
    },
    validationSchema: Yup.object({
      name: Yup.string().when("$step", {
        is: 1,
        then: (schema) => schema.required("Naam likhna zaroori hai"),
      }),
      occupation: Yup.string().when("$step", {
        is: 2,
        then: (schema) => schema.required("Occupation chuniye"),
      }),
      interests: Yup.array().when("$step", {
        is: 3,
        then: (schema) => schema.min(1, "Kam az kam aik interest chuniye"),
      }),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        const { data, error } = await supabase
          .from("onboarding_details")
          .insert([
            {
              user_id: user?.id,
              full_name: values.name,
              occupation: values.occupation,
              interests: values.interests,
            },
          ]);
        setFromOnboardingScreen(true);
        router.push("/voice");
      } catch (error) {
      } finally {
        setLoading(false);
      }
    },
  });

  const handleSelectInterest = (interest: string) => {
    const current = formik.values.interests;
    if (current.includes(interest)) {
      formik.setFieldValue(
        "interests",
        current.filter((i) => i !== interest)
      );
    } else {
      formik.setFieldValue("interests", [...current, interest]);
    }
  };

  // ===========================
  // STEP RENDERING LOGIC
  // ===========================
  const getOnBoardingStep = () => {
    if (step === 0) {
      return (
        <Box sx={sx.stepOneBox}>
          <Typography sx={sx.heading}>Humraaz</Typography>
          <Button onClick={() => setStep(1)} sx={sx.continueBtn}>
            Continue
          </Button>
        </Box>
      );
    }

    if (step === 1) {
      return (
        <Box sx={sx.stepTwoBox}>
          <Typography sx={sx.subHeading}>Apka naam kya hai?</Typography>
          <TextField
            variant="standard"
            name="name"
            value={formik.values.name}
            onChange={formik.handleChange}
            error={Boolean(formik.errors.name)}
            helperText={formik.errors.name}
            sx={sx.textField}
          />
          <Button
            onClick={() => {
              if (!formik.values.name.trim()) {
                formik.validateForm();
                return;
              }
              setStep(2);
            }}
            sx={[sx.continueBtn, { mt: "30px" }]}
          >
            Continue
          </Button>
        </Box>
      );
    }

    if (step === 2) {
      return (
        <Box sx={sx.stepTwoBox}>
          <Typography sx={sx.subHeading}>Aap kya kaam karte hai?</Typography>
          <Box sx={sx.occupationBox}>
            {occupations.map((occupation) => (
              <Button
                key={occupation.value}
                sx={sx.occupationBtn}
                onClick={() => {
                  formik.setFieldValue("occupation", occupation.value);
                  setStep(3);
                }}
              >
                {occupation.label}
              </Button>
            ))}
          </Box>
        </Box>
      );
    }

    if (step === 3) {
      const availableInterests = interests[formik.values.occupation] || [];
      return (
        <Box sx={sx.stepTwoBox}>
          <Typography sx={sx.subHeading}>
            Apko kin cheezo ka shoq hai?
          </Typography>
          <Box sx={sx.chipsBox}>
            {availableInterests.map((interest) => {
              const isSelected = formik.values.interests.includes(interest);
              return (
                <Chip
                  key={interest}
                  label={interest}
                  variant={isSelected ? "filled" : "outlined"}
                  onClick={() => handleSelectInterest(interest)}
                  onDelete={
                    isSelected
                      ? () => handleSelectInterest(interest)
                      : undefined
                  }
                  sx={sx.chip(isSelected)}
                />
              );
            })}
          </Box>
          {formik.values.interests.length > 0 && (
            <Button
              onClick={() => formik.handleSubmit()}
              sx={[sx.continueBtn, { mt: "40px" }]}
              endIcon={
                loading && <CircularProgress size={18} color="secondary" />
              }
              disabled={loading}
            >
              Continue
            </Button>
          )}
        </Box>
      );
    }
  };

  return (
    <Box sx={sx.main}>
      {step > 0 && (
        <Box sx={sx.backArrowBox}>
          <IconButton onClick={() => setStep((e) => e - 1)}>
            <Image
              src="/icons/back_arrow.svg"
              alt="back arrow"
              width={40}
              height={40}
            />
          </IconButton>
        </Box>
      )}
      <VoiceOrb loading={false} marginBottom="0px" />
      {getOnBoardingStep()}
    </Box>
  );
};

export default OnboardingPage;
