import "server-only";

import { StreamChat } from "stream-chat";
import { getRequiredServerEnv } from "@/lib/env";

let streamChatInstance: StreamChat | null = null;

function getStreamChat() {
  if (!streamChatInstance) {
    streamChatInstance = StreamChat.getInstance(
      getRequiredServerEnv("NEXT_PUBLIC_STREAM_CHAT_API_KEY"),
      getRequiredServerEnv("STREAM_CHAT_SECRET_KEY")
    );
  }

  return streamChatInstance;
}

export const streamChat = new Proxy({} as StreamChat, {
  get(_target, prop, receiver) {
    return Reflect.get(getStreamChat(), prop, receiver);
  },
});
