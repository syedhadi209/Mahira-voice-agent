"use server";

import { AccessToken } from "livekit-server-sdk";

export async function getToken(roomName: string, participantName: string) {
  const apiKey = process.env.LIVEKIT_API_KEY!;
  const apiSecret = process.env.LIVEKIT_API_SECRET!;

  const at = new AccessToken(apiKey, apiSecret, {
    identity: participantName,
    ttl: 3600, // 1 hour
  });

  // allow publishing mic + subscribing
  at.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
  });

  return await at.toJwt();
}
