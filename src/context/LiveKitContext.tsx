"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Room,
  RoomEvent,
  ConnectionState,
  RemoteAudioTrack,
  Track,
  createLocalTracks,
} from "livekit-client";

type AgentState = "idle" | "listening" | "speaking" | "thinking";

interface LiveKitContextValue {
  room: Room | null;
  connectionState: ConnectionState;
  connectToRoom: (token: string, serverUrl: string) => Promise<void>;
  disconnectFromRoom: () => Promise<void>;
  toggleMute: () => void;
  isMuted: boolean;
  audioTrack: RemoteAudioTrack | null;
  connecting: boolean;
  agentState: AgentState;
}

const LiveKitContext = createContext<LiveKitContextValue | null>(null);

export const LiveKitProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [connectionState, setConnectionState] = useState(
    ConnectionState.Disconnected
  );
  const [isMuted, setIsMuted] = useState(false);
  const [audioTrack, setAudioTrack] = useState<RemoteAudioTrack | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [agentState, setAgentState] = useState<AgentState>("idle");

  /**
   * ✅ Connect to LiveKit and publish mic
   */
  const connectToRoom = async (token: string, serverUrl: string) => {
    if (connecting) {
      console.warn("⏳ Already connecting...");
      return;
    }

    if (room && room.state !== ConnectionState.Disconnected) {
      console.warn("⚠️ Already connected to a room");
      return;
    }

    setConnecting(true);
    setAgentState("thinking");

    try {
      const newRoom = new Room();
      setRoom(newRoom);

      // 🔄 Connection lifecycle
      newRoom.on(RoomEvent.ConnectionStateChanged, (state) => {
        console.log(`🔄 Room connection state: ${state}`);
        setConnectionState(state);
        if (state === ConnectionState.Connected) setConnecting(false);
      });

      // 🎧 Handle remote audio track
      newRoom.on(
        RoomEvent.TrackSubscribed,
        (track, publication, participant) => {
          if (track.kind === Track.Kind.Audio) {
            console.log("🎧 Remote audio subscribed:", participant.identity);
            setAudioTrack(track as RemoteAudioTrack);
            setAgentState("speaking");
          }
        }
      );

      newRoom.on(RoomEvent.TrackUnsubscribed, (track) => {
        if (track.kind === Track.Kind.Audio) {
          console.log("🔇 Remote audio unsubscribed");
          setAudioTrack(null);
          setAgentState("idle");
        }
      });

      // 🗣️ Detect active speakers dynamically
      newRoom.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
        if (speakers.length === 0) {
          if (!isMuted) setAgentState("listening");
          return;
        }

        const agentIsSpeaking = speakers.some(
          (s) => s.sid !== newRoom.localParticipant.sid
        );

        if (agentIsSpeaking) {
          setAgentState("speaking");
        } else if (!isMuted) {
          setAgentState("listening");
        }
      });

      // 💬 Handle data messages (thinking/listening updates)
      newRoom.on(RoomEvent.DataReceived, (payload, participant) => {
        try {
          const message = new TextDecoder().decode(payload);
          console.log(
            `💬 Agent data message from ${participant?.identity}:`,
            message
          );

          if (message.includes("listening")) setAgentState("listening");
          else if (message.includes("thinking")) setAgentState("thinking");
          else if (message.includes("speaking")) setAgentState("speaking");
        } catch (err) {
          console.warn("⚠️ Failed to parse data message", err);
        }
      });

      // ✅ Connect to LiveKit
      await newRoom.connect(serverUrl, token);
      console.log("✅ Connected to LiveKit room:", newRoom.name);

      // 🎤 Request mic access and publish it
      const tracks = await createLocalTracks({
        audio: true,
        video: false,
      });

      for (const track of tracks) {
        await newRoom.localParticipant.publishTrack(track);
      }

      console.log("🎤 Microphone activated and published");
      setAgentState("listening");
    } catch (error) {
      console.error("❌ Failed to connect to LiveKit:", error);
      setConnecting(false);
      setAgentState("idle");
    }
  };

  /**
   * ✅ Disconnect from room gracefully
   */
  const disconnectFromRoom = async () => {
    if (!room) return;
    console.log("🚪 Disconnecting from room...");
    await room.disconnect();
    setRoom(null);
    setConnectionState(ConnectionState.Disconnected);
    setAudioTrack(null);
    setAgentState("idle");
  };

  /**
   * 🎚️ Toggle local mic mute/unmute
   */
  const toggleMute = () => {
    if (!room) return;
    const local = room.localParticipant;
    const newMuted = !isMuted;
    local.setMicrophoneEnabled(!newMuted);
    setIsMuted(newMuted);
    setAgentState(newMuted ? "thinking" : "listening");
  };

  /**
   * 🧹 Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (room) {
        console.log("🧹 Cleaning up LiveKit room...");
        room.disconnect();
      }
    };
  }, [room]);

  return (
    <LiveKitContext.Provider
      value={{
        room,
        connectionState,
        connectToRoom,
        disconnectFromRoom,
        toggleMute,
        isMuted,
        audioTrack,
        connecting,
        agentState,
      }}
    >
      {children}
    </LiveKitContext.Provider>
  );
};

/**
 * ✅ Hook for consuming LiveKit context
 */
export const useLiveKit = () => {
  const ctx = useContext(LiveKitContext);
  if (!ctx) throw new Error("useLiveKit must be used within a LiveKitProvider");
  return ctx;
};
