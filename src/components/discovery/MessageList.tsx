import type { DiscoveryMessage } from "@/types/discovery.types";
import type React from "react";

interface MessagesListProps {
  messages: DiscoveryMessage[];
}

export const MessageList: React.FC<MessagesListProps> = ({ messages }) => {
  return (
    <div>
      {messages.map((message) => (
        <div key={message.id}>{message.content}</div>
      ))}
    </div>
  );
};
