import { useVoiceAssistant, AudioTrack } from "@livekit/components-react";
import { Box } from "@mui/material";

export const AgentUI = () => {
  const { state, audioTrack } = useVoiceAssistant();

  console.log(state);

  return (
    <Box sx={{ padding: 20 }}>
      {audioTrack && <AudioTrack trackRef={audioTrack} />}
    </Box>
  );
};
