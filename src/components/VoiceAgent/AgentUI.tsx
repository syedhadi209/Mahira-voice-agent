import { useVoiceAssistant, AudioTrack } from "@livekit/components-react";
import { Box } from "@mui/material";
import VoiceOrb from "../Visualizer/VoiceOrb";

export const AgentUI = ({ loadingData }: any) => {
  const { state, audioTrack } = useVoiceAssistant();

  return (
    <Box sx={{ padding: 20 }}>
      {/* Voice Orb always visible */}
      <VoiceOrb
        loading={loadingData}
        size="200px"
        marginLeft="10px"
        currentState={state}
        marginBottom="40px"
      />
      {audioTrack && <AudioTrack trackRef={audioTrack} />}
    </Box>
  );
};
