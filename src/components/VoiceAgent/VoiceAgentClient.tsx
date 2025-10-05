"use client";

import React, { useEffect, useRef, useState } from "react";
import "@livekit/components-styles";
import { LiveKitRoom } from "@livekit/components-react";
import { getToken } from "@/app/actions/getToken";
import { AgentUI } from "./AgentUI";
import VoiceOrb from "../Visualizer/VoiceOrb";
import { Box, Button, CircularProgress } from "@mui/material";
import Image from "next/image";
import CloseIcon from "@mui/icons-material/Close";
import { supabase } from "@/lib/supabaseClient";
import { useSettings } from "@/context/SettingsContext"; // ✅ import your context

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
    justifyContent: "space-between",
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
});

export default function VoiceAgentClient() {
  const sx = makeStyles();
  const { fromOnboardingScreen, setFromOnboardingScreen } = useSettings(); // ✅ use context
  const [token, setToken] = useState<string | undefined>();
  const [connect, setConnect] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [showActionButtons, setShowActionButtons] = useState(
    !fromOnboardingScreen
  ); // ✅ hidden initially if onboarding
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

  return (
    <Box sx={sx.main}>
      {/* Voice Orb always visible */}
      <VoiceOrb loading={loadingData} />

      {/* Logout Button */}
      <Box sx={{ position: "absolute", top: "50px", right: 0 }}>
        <Button
          variant="outlined"
          onClick={handleLogout}
          sx={{
            background: "#FFFFFF14",
            color: "white",
            textTransform: "none",
          }}
        >
          Logout
        </Button>
      </Box>

      {/* ✅ Animated Action Buttons */}
      <Box sx={sx.actionBtnsBox(showActionButtons)}>
        <Button sx={sx.actionBtns(false)}>
          <Image
            src="/icons/chat_icon.svg"
            alt="chat icon"
            width={32.17}
            height={28.96}
          />
        </Button>

        {connect ? (
          <Button sx={sx.actionBtns(connect)} onClick={() => setConnect(false)}>
            {connecting ? (
              <CircularProgress size={23} sx={{ color: "black" }} />
            ) : (
              <CloseIcon
                sx={{ color: "#B11215", width: 17.68, height: 17.68 }}
              />
            )}
          </Button>
        ) : (
          <Box
            sx={{ position: "relative", display: "flex", alignItems: "center" }}
          >
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
            audio
            onConnected={() => setConnecting(false)}
          >
            <AgentUI />
          </LiveKitRoom>
        </Box>
      )}
    </Box>
  );
}
