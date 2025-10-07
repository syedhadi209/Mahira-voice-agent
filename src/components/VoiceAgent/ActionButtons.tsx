"use client";

import { Box, Button, CircularProgress } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Image from "next/image";
import { useSettings } from "@/context/SettingsContext";
import { useConnectionState, useRoomContext } from "@livekit/components-react";
import { ConnectionState } from "livekit-client";
import { useState } from "react";

const makeStyles = () => ({
  actionBtnsBox: (visible: boolean) => ({
    position: "absolute",
    display: "flex",
    width: "100%",
    bottom: visible ? "63.43px" : "-200px",
    justifyContent: "space-between",
    padding: "0 22px",
    transition: "bottom 0.8s ease-in-out",
  }),
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
  actionBtns: (isConnected: boolean) => ({
    height: "67.57px",
    width: "67.57px",
    borderRadius: "50%",
    background: isConnected ? "#FFFCFCE3" : "#FFFFFF14",
  }),
});

const ActionButtons = ({
  showActionButtons,
  fetchToken,
  setConnecting,
  connecting,
}: any) => {
  const sx = makeStyles();
  const { fromOnboardingScreen, setFromOnboardingScreen } = useSettings();
  const [isMuted, setIsMuted] = useState(false);

  const room = useRoomContext();
  const connectionState = useConnectionState(room);

  const toggleMute = async () => {
    if (!room) return;

    try {
      const newMutedState = !isMuted;
      await room.localParticipant.setMicrophoneEnabled(!newMutedState);
      setIsMuted(newMutedState);
    } catch (error) {
      console.error("Error toggling mute:", error);
    }
  };

  return (
    <Box sx={sx.actionBtnsBox(showActionButtons)}>
      <Button sx={sx.actionBtns(false)}>
        <Image
          src="/icons/chat_icon.svg"
          alt="chat icon"
          width={32.17}
          height={28.96}
        />
      </Button>

      {connectionState == ConnectionState.Connected ? (
        <Box sx={sx.btnsBox}>
          {/* Disconnect (X) Button */}
          <Button sx={sx.disconnectBtn} onClick={() => room.disconnect()}>
            <CloseIcon sx={sx.closeIcon} />
          </Button>

          {/* Mute / Unmute Button */}
          <Button sx={sx.muteBtn} onClick={toggleMute}>
            <Image
              src={isMuted ? "/icons/mic_off.svg" : "/icons/mic_on.svg"}
              alt={isMuted ? "Unmute mic" : "Mute mic"}
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
              fetchToken();
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
  );
};

export default ActionButtons;
