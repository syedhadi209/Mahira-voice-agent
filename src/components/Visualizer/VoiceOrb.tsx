import { Box, CircularProgress } from "@mui/material";
import React from "react";

const VoiceOrb = ({ loading }: { loading: boolean }) => {
  return (
    <>
      {loading ? (
        <CircularProgress />
      ) : (
        <Box
          sx={{
            height: "150px",
            width: "150px",
            borderRadius: "50%",
            border: "10px solid white",
            marginBottom: "200px",
          }}
        ></Box>
      )}
    </>
  );
};

export default VoiceOrb;
