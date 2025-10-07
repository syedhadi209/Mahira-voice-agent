"use client";

import React, { useEffect, useState } from "react";
import "@livekit/components-styles";
import { LiveKitRoom } from "@livekit/components-react";
import { getToken } from "@/app/actions/getToken";
import { AgentUI } from "./AgentUI";
import {
  Box,
  Button,
  Grow,
  IconButton,
  Snackbar,
  SnackbarCloseReason,
} from "@mui/material";
import { supabase } from "@/lib/supabaseClient";
import { useSettings } from "@/context/SettingsContext";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ActionButtons from "./ActionButtons";

const makeStyles = () => ({
  main: {
    display: "flex",
    height: "100vh",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    maxWidth: "375px",
    margin: "auto",
    overflow: "hidden",
  },
  startBtn: {
    marginTop: "20px",
    padding: "12px 20px",
    fontSize: "16px",
    borderRadius: "6px",
    background: "#4F46E5",
    color: "white",
    cursor: "pointer",
    border: "none",
  },
  liveKitRoomBox: {
    width: "100%",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    position: "relative",
  },
  popupMenu: {
    position: "absolute",
    top: "50px",
    right: "10px",
    background: "#FFFFFF14",
    borderRadius: "8px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    padding: "8px 0",
    minWidth: "120px",
    zIndex: 100,
    boxShadow: "none",
    border: "1px solid #FFFFFF17",
  },
  menuButton: {
    color: "white",
    textTransform: "none",
    justifyContent: "flex-start",
    px: 2,
    "&:hover": {
      background: "#FFFFFF22",
    },
  },
  iconBtn: {
    color: "white",
    background: "#FFFFFF14",
    "&:hover": { background: "#FFFFFF25" },
  },
  threeDotsBox: { position: "absolute", top: "40px", right: "10px" },
});

export default function VoiceAgentClient() {
  const sx = makeStyles();
  const { fromOnboardingScreen, setFromOnboardingScreen } = useSettings();
  const [token, setToken] = useState<string | undefined>();
  const [connecting, setConnecting] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showActionButtons, setShowActionButtons] = useState(
    !fromOnboardingScreen
  );
  const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  async function fetchToken() {
    setLoadingData(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const t = await getToken("agent-room", `user-${user?.id}`);
      setToken(t);
    } catch (err) {
      console.error("getToken error:", err);
    } finally {
      setLoadingData(false);
    }
  }

  useEffect(() => {
    if (fromOnboardingScreen) {
      const timer = setTimeout(() => {
        setShowActionButtons(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [fromOnboardingScreen, setFromOnboardingScreen]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error.message);
    } else {
      window.location.href = "/login";
    }
  };

  const handleShare = async () => {
    await navigator.clipboard.writeText(
      "https://mahira-nine.vercel.app/signup"
    );
    setOpen(true);
  };

  const handleClose = (
    event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  return (
    <Box sx={sx.main}>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        message="Link copied to clipboard."
      />

      {/* LiveKit Room */}
      <Box sx={sx.liveKitRoomBox}>
        {/* Three-dot Menu Button */}
        <Box sx={sx.threeDotsBox}>
          <IconButton onClick={() => setMenuOpen(!menuOpen)} sx={sx.iconBtn}>
            <MoreHorizIcon />
          </IconButton>

          <Grow in={menuOpen}>
            <Box sx={sx.popupMenu}>
              <Button sx={sx.menuButton} onClick={handleLogout}>
                Logout
              </Button>
              <Button sx={sx.menuButton} onClick={handleShare}>
                Share
              </Button>
            </Box>
          </Grow>
        </Box>

        <LiveKitRoom
          token={token}
          serverUrl={serverUrl}
          connect={!!token}
          audio
          onConnected={() => {
            console.log("Successfully connected to the room.");
            setConnecting(false);
          }}
          onDisconnected={() => {
            console.log("Disconnected from the room.");
            setConnecting(false);
          }}
          onError={(error) => {
            console.error("LiveKit connection error:", error);
            setConnecting(false);
          }}
        >
          <AgentUI loadingData={loadingData} />
          <ActionButtons
            showActionButtons={showActionButtons}
            fetchToken={fetchToken}
            setConnecting={setConnecting}
            connecting={connecting}
          />
        </LiveKitRoom>
        {/* ✅ Animated Action Buttons */}
      </Box>
    </Box>
  );
}
