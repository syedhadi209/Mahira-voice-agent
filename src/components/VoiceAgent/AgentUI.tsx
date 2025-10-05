import {
  useVoiceAssistant,
  AudioTrack,
  useRoomContext,
} from "@livekit/components-react";
import { Box } from "@mui/material";
import { useEffect } from "react";

export const AgentUI = ({ setCurrentState }: any) => {
  const { state, audioTrack } = useVoiceAssistant();

  useEffect(() => {
    if (state) {
      setCurrentState(state);
    }
  }, [state]);

  return (
    <Box sx={{ padding: 20 }}>
      {audioTrack && <AudioTrack trackRef={audioTrack} />}
    </Box>
  );
};
