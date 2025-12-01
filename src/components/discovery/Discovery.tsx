import React from "react";
import { DiscoveryProvider, useDiscoveryContext } from "./DiscoveryProvider";
import { ConversationWindow } from "./ConversationWindow";
import { DiscoveryInput } from "./DiscoveryInput";
import { ReactMemoizedMessageList } from "./DiscoveryMessageList";
import { MemoizedDiscoveryMessageItem } from "./DiscoveryMessageItem";

// Compound Component API
interface DiscoveryProps {
  userId: string;
  sessionId?: string;
  children: React.ReactNode;
  onComplete?: (sessionId: string) => void;
  onError?: (error: Error) => void;
}

const DiscoveryRoot = ({ userId, sessionId, children, onComplete, onError }: DiscoveryProps) => {
  return (
    <DiscoveryProvider userId={userId} sessionId={sessionId} onComplete={onComplete} onError={onError}>
      {children}
    </DiscoveryProvider>
  );
};
// Sub-components
DiscoveryRoot.Window = ConversationWindow;
DiscoveryRoot.Input = DiscoveryInput;
DiscoveryRoot.MessageList = ReactMemoizedMessageList;
DiscoveryRoot.MessageItem = MemoizedDiscoveryMessageItem;

export const useDiscovery = useDiscoveryContext;
export const Discovery = DiscoveryRoot;
