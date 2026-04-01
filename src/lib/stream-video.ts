import "server-only";

import { StreamClient } from "@stream-io/node-sdk";
import { getRequiredServerEnv } from "@/lib/env";

let streamVideoInstance: StreamClient | null = null;

function getStreamVideo() {
  if (!streamVideoInstance) {
    streamVideoInstance = new StreamClient(
      getRequiredServerEnv("NEXT_PUBLIC_STREAM_VIDEO_API_KEY"),
      getRequiredServerEnv("STREAM_VIDEO_SECRET_KEY")
    );
  }

  return streamVideoInstance;
}

export const streamVideo = new Proxy({} as StreamClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getStreamVideo(), prop, receiver);
  },
});
