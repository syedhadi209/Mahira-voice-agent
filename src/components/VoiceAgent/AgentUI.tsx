import { Box } from "@mui/material";
import VoiceOrb from "../Visualizer/VoiceOrb";
import { useLiveKit } from "@/context/LiveKitContext";

export const AgentUI = ({ loadingData }: any) => {
  const { audioTrack, agentState } = useLiveKit();

  return (
    <Box sx={{ padding: 20 }}>
      {/* Voice Orb always visible */}
      <VoiceOrb
        loading={loadingData}
        size="200px"
        marginLeft="10px"
        currentState={agentState}
        marginBottom="40px"
      />
      {/* {audioTrack && <AudioTrack trackRef={audioTrack} />} */}
      {audioTrack && (
        <audio
          ref={(el) => {
            if (el && audioTrack) {
              audioTrack.attach(el);
            }
          }}
          autoPlay
        />
      )}
    </Box>
  );
};
