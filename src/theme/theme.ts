"use client";

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2", // corporate blue
    },
    secondary: {
      main: "#9c27b0",
    },
  },
  typography: {
    fontFamily: "Inter, sans-serif",
  },
});

export default theme;
