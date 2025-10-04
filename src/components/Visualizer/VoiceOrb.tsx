import { Box, CircularProgress, keyframes } from "@mui/material";
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
  mainBox: {
    position: "relative",
    width: "200px",
    height: "200px",
    mb: "100px",
    ml: "50px",
  },
  circles: (
    opacity: string,
    top: string = "auto",
    left: string = "auto",
    right: string = "auto",
    bottom: string = "auto",
    direction: "clockwise" | "anticlockwise" = "clockwise",
    duration: string = "6s"
  ) => ({
    height: "150px",
    width: "150px",
    boxShadow: "0 0 20px rgba(255, 255, 255, 0.7)",
    borderRadius: "46%",
    border: "8px solid rgba(255, 255, 255, 0.6)",
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
});

const VoiceOrb = ({ loading }: { loading: boolean }) => {
  const sx = makeStyles();

  return (
    <>
      {loading ? (
        <CircularProgress />
      ) : (
        <Box sx={sx.mainBox}>
          {/* Outer Circle - clockwise */}
          <Box
            sx={sx.circles(
              "0.5",
              "0px",
              "0px",
              "0px",
              "0px",
              "clockwise",
              "8s"
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
              "10s"
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
              "4s"
            )}
          />
        </Box>
      )}
    </>
  );
};

export default VoiceOrb;
