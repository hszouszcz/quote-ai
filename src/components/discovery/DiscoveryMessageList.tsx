import type { DiscoveryMessage } from "@/types/discovery.types";
import React from "react";
import { Discovery } from "./Discovery";

interface MessagesListProps {
  messages: DiscoveryMessage[];
}

const MessageList: React.FC<MessagesListProps> = ({ messages }) => {
  return (
    <div>
      {messages.map((message) => (
        <Discovery.MessageItem key={message.id} {...message} />
      ))}
    </div>
  );
};

export const ReactMemoizedMessageList = React.memo(MessageList);
