import { Box, CircularProgress, keyframes, Typography } from "@mui/material";
import React from "react";

// Define rotation animations
const rotateClockwise = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const rotateAnticlockwise = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(-360deg); }
`;

const makeStyles = () => ({
  mainBox: (mb: string, ml: string) => ({
    position: "relative",
    width: "200px",
    height: "200px",
    mb,
    ml,
  }),
  circles: (
    opacity: string,
    top: string = "auto",
    left: string = "auto",
    right: string = "auto",
    bottom: string = "auto",
    direction: "clockwise" | "anticlockwise" = "clockwise",
    duration: string = "6s",
    size: string = "150px",
    borderColor: string,
    glow: string
  ) => ({
    height: size,
    width: size,
    boxShadow: glow,
    borderRadius: "46%",
    border: `8px solid ${borderColor}`,
    opacity,
    position: "absolute",
    top,
    left,
    right,
    bottom,
    animation: `${
      direction === "clockwise" ? rotateClockwise : rotateAnticlockwise
    } ${duration} linear infinite`,
  }),
  stateText: {
    position: "relative",
    zIndex: 5,
    color: "white",
    fontWeight: 600,
    fontSize: "18px",
    textTransform: "capitalize",
    textShadow: "0 0 10px rgba(0,0,0,0.6)",
  },
});

const VoiceOrb = ({
  loading,
  marginBottom = "100px",
  size = "150px",
  marginLeft = "50px",
  currentState,
}: {
  loading: boolean;
  marginBottom?: string;
  size?: string;
  marginLeft?: string;
  currentState?: "connecting" | "thinking" | "listening" | "speaking" | "";
}) => {
  const sx = makeStyles();

  const stateColors: Record<string, { border: string; glow: string }> = {
    connecting: {
      border: "rgba(255, 255, 255, 0.6)",
      glow: "0 0 20px rgba(255, 255, 255, 0.7)",
    },
    listening: {
      border: "rgba(0, 255, 150, 0.8)",
      glow: "0 0 25px rgba(0, 255, 150, 0.7)",
    },
    thinking: {
      border: "rgba(170, 0, 255, 0.8)",
      glow: "0 0 25px rgba(170, 0, 255, 0.8)",
    },
    speaking: {
      border: "rgba(255, 140, 0, 0.9)",
      glow: "0 0 25px rgba(255, 140, 0, 0.8)",
    },
    default: {
      border: "rgba(255, 255, 255, 0.6)",
      glow: "0 0 20px rgba(255, 255, 255, 0.5)",
    },
  };

  const { border, glow } =
    stateColors[currentState || "default"] || stateColors.default;

  return (
    <>
      {loading ? (
        <CircularProgress />
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Box sx={sx.mainBox(marginBottom, marginLeft)}>
            {/* Outer Circle - clockwise */}
            <Box
              sx={sx.circles(
                "0.5",
                "0px",
                "0px",
                "0px",
                "0px",
                "clockwise",
                "8s",
                size,
                border,
                glow
              )}
            />

            {/* Middle Circle - anticlockwise */}
            <Box
              sx={sx.circles(
                "0.6",
                "5px",
                "4px",
                "0px",
                "0px",
                "anticlockwise",
                "10s",
                size,
                border,
                glow
              )}
            />

            {/* Inner Circle - clockwise but faster */}
            <Box
              sx={sx.circles(
                "0.8",
                "-3px",
                "0px",
                "10px",
                "0px",
                "clockwise",
                "4s",
                size,
                border,
                glow
              )}
            />
          </Box>
          <Typography sx={sx.stateText}>{currentState || ""}</Typography>
        </Box>
      )}
    </>
  );
};

export default VoiceOrb;
