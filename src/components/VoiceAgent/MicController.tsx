"use client";

import { useRoomContext } from "@livekit/components-react";
import { useEffect } from "react";

export default function MicController({ muted }: { muted: boolean }) {
  const room = useRoomContext();

  useEffect(() => {
    if (!room) return;

    const localParticipant = room.localParticipant;

    // Toggle mic based on state
    localParticipant.setMicrophoneEnabled(!muted);
  }, [muted, room]);

  return null; // This component just controls mic state
}
