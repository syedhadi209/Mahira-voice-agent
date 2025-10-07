"use server";

import { AccessToken } from "livekit-server-sdk";

export async function getToken(user_id: string) {
  const roomName = `agent-room-${user_id}`;
  const apiKey = process.env.LIVEKIT_API_KEY!;
  const apiSecret = process.env.LIVEKIT_API_SECRET!;
  const identity = `user-${user_id}`;

  const at = new AccessToken(apiKey, apiSecret, {
    identity: identity,
    ttl: 3600,
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
