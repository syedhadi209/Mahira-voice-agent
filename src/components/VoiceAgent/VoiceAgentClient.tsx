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
  actionBtnsBox: {
    position: "absolute",
    display: "flex",
    width: "100%",
    bottom: "63.43px",
    justifyContent: "space-between",
    padding: "0 22px",
  },
});

export default function VoiceAgentClient() {
  const sx = makeStyles();
  const [token, setToken] = useState<string | undefined>();
  const [connect, setConnect] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  useEffect(() => {
    async function fetchToken() {
      try {
        const t = await getToken(
          "agent-room",
          `user-${Math.floor(Math.random() * 10000)}`
        );
        setToken(t);
      } catch (err) {
        console.error("getToken error:", err);
      }
    }
    fetchToken();
  }, []);

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
      <VoiceOrb />

      <Box sx={{ position: "absolute", top: 0, right: 0 }}>
        <Button variant="outlined" onClick={handleLogout}>
          Logout
        </Button>
      </Box>

      <Box sx={sx.actionBtnsBox}>
        <Button sx={sx.actionBtns(false)}>
          <Image
            src="/icons/chat_icon.svg"
            alt="chat icon"
            width={32.17}
            height={28.96}
          />
        </Button>

        {connect ? (
          <Button
            sx={sx.actionBtns(connect)}
            onClick={() => {
              setConnect(false);
            }}
          >
            {connecting ? (
              <CircularProgress size={23} sx={{ color: "black" }} />
            ) : (
              <CloseIcon
                sx={{
                  color: "#B11215",
                  width: 17.68,
                  height: 17.68,
                }}
              />
            )}
          </Button>
        ) : (
          <Button
            sx={sx.actionBtns(false)}
            onClick={() => {
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
        )}
      </Box>

      {/* Show LiveKit Room when connected */}
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
