import type { DiscoveryMessage } from "@/types/discovery.types";
import React from "react";

interface MessagesListProps {
  messages: DiscoveryMessage[];
}

const MessageList: React.FC<MessagesListProps> = ({ messages }) => {
  return (
    <div>
      {messages.map((message) => (
        <div key={message.id}>{message.content}</div>
      ))}
    </div>
  );
};

export const ReactMemoizedMessageList = React.memo(MessageList);
