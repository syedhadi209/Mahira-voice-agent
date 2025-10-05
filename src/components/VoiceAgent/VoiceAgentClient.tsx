"use client";

import React, { useEffect, useRef, useState } from "react";
import "@livekit/components-styles";
import { LiveKitRoom } from "@livekit/components-react";
import { getToken } from "@/app/actions/getToken";
import { AgentUI } from "./AgentUI";
import VoiceOrb from "../Visualizer/VoiceOrb";
import {
  Box,
  Button,
  CircularProgress,
  Grow,
  IconButton,
  Snackbar,
  SnackbarCloseReason,
  Typography,
} from "@mui/material";
import Image from "next/image";
import CloseIcon from "@mui/icons-material/Close";
import { supabase } from "@/lib/supabaseClient";
import { useSettings } from "@/context/SettingsContext";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import MicController from "./MicController";

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
    marginTop: "20px",
    width: "100%",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    position: "absolute",
  },
  actionBtns: (isConnected: boolean) => ({
    height: "67.57px",
    width: "67.57px",
    borderRadius: "50%",
    background: isConnected ? "#FFFCFCE3" : "#FFFFFF14",
  }),
  // ✅ Animate this box
  actionBtnsBox: (visible: boolean) => ({
    position: "absolute",
    display: "flex",
    width: "100%",
    bottom: visible ? "63.43px" : "-200px",
    justifyContent: "center",
    padding: "0 22px",
    transition: "bottom 0.8s ease-in-out",
  }),
  tooltip: {
    position: "absolute",
    bottom: "85px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "white",
    color: "black",
    fontSize: "14px",
    fontWeight: 500,
    borderRadius: "16px",
    padding: "8px 16px",
    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    width: "100px", // ✅ control tooltip width here
    textAlign: "center",
    animation: "fadeIn 0.6s ease-in-out, hoverFloat 2s ease-in-out infinite",
    "&::after": {
      content: '""',
      position: "absolute",
      bottom: "-6px",
      left: "50%",
      transform: "translateX(-50%)",
      width: 0,
      height: 0,
      borderLeft: "6px solid transparent",
      borderRight: "6px solid transparent",
      borderTop: "6px solid white",
    },
    "@keyframes fadeIn": {
      from: { opacity: 0, transform: "translate(-50%, 10px)" },
      to: { opacity: 1, transform: "translate(-50%, 0)" },
    },
    "@keyframes hoverFloat": {
      "0%, 100%": { transform: "translate(-50%, 0)" },
      "50%": { transform: "translate(-50%, -5px)" },
    },
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
  btnsBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#ECE3F3",
    borderRadius: "35px",
    padding: "0px 4.43px",
    width: "137px",
    height: "73px",
    position: "relative",
    transition: "all 0.3s ease",
  },
  disconnectBtn: {
    minWidth: 0,
    width: "42px",
    height: "42px",
    backgroundColor: "transparent",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    ml: "10px",
    "&:hover": { backgroundColor: "#F4EFFF" },
  },
  closeIcon: { color: "#B11215", fontSize: "35px" },
  muteBtn: {
    minWidth: 0,
    width: "67px",
    height: "67px",
    borderRadius: "50%",
    backgroundColor: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    "&:hover": { backgroundColor: "white" },
  },
  mainMicBtn: { position: "relative", display: "flex", alignItems: "center" },
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
  const [connect, setConnect] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [open, setOpen] = useState(false);
  const [currentState, setCurrentState] = useState<
    "connecting" | "thinking" | "listening" | "speaking" | ""
  >("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [showActionButtons, setShowActionButtons] = useState(
    !fromOnboardingScreen
  );
  const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  // Fetch token
  useEffect(() => {
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
    fetchToken();
  }, []);

  // ✅ Animate entry if from onboarding
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

  const action = (
    <React.Fragment>
      <Typography>Link copied to clipboard.</Typography>
    </React.Fragment>
  );

  return (
    <Box sx={sx.main}>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        message="Link copied to clipboard."
      />
      {/* Voice Orb always visible */}
      <VoiceOrb
        loading={loadingData}
        size="200px"
        marginLeft="10px"
        currentState={currentState}
        marginBottom="40px"
      />

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

      {/* ✅ Animated Action Buttons */}
      <Box sx={sx.actionBtnsBox(showActionButtons)}>
        {/* <Button sx={sx.actionBtns(false)}>
          <Image
            src="/icons/chat_icon.svg"
            alt="chat icon"
            width={32.17}
            height={28.96}
          />
        </Button> */}

        {connect ? (
          <Box sx={sx.btnsBox}>
            {/* Disconnect (X) Button */}
            <Button
              onClick={() => {
                setCurrentState("");
                setConnect(false);
              }}
              sx={sx.disconnectBtn}
            >
              <CloseIcon sx={sx.closeIcon} />
            </Button>

            {/* Mute / Unmute Button */}
            <Button onClick={() => setMuted((prev) => !prev)} sx={sx.muteBtn}>
              <Image
                src={muted ? "/icons/mic_off.svg" : "/icons/mic_on.svg"}
                alt="mic toggle"
                width={25}
                height={25}
              />
            </Button>
          </Box>
        ) : (
          // existing microphone button remains unchanged
          <Box sx={sx.mainMicBtn}>
            {fromOnboardingScreen && <Box sx={sx.tooltip}>Tap to talk</Box>}
            <Button
              sx={sx.actionBtns(false)}
              onClick={() => {
                setFromOnboardingScreen(false);
                setConnecting(true);
                setConnect(true);
              }}
            >
              {connecting ? (
                <CircularProgress size={23} sx={{ color: "white" }} />
              ) : (
                <Image
                  src="/icons/mic_icon.svg"
                  alt="chat icon"
                  width={22.52}
                  height={32.17}
                />
              )}
            </Button>
          </Box>
        )}
      </Box>

      {/* LiveKit Room */}
      {connect && (
        <Box sx={sx.liveKitRoomBox}>
          <LiveKitRoom
            token={token}
            serverUrl={serverUrl}
            connect={!!token}
            audio={{
              autoGainControl: true,
              noiseSuppression: false,
              echoCancellation: true,
              sampleRate: 48000,
              channelCount: 1,
            }}
            onConnected={() => setConnecting(false)}
          >
            <AgentUI setCurrentState={setCurrentState} />
          </LiveKitRoom>
        </Box>
      )}
    </Box>
  );
}
