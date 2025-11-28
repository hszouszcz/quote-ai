import React from "react";
import { DiscoveryProvider, useDiscoveryContext } from "./DiscoveryProvider";
import { ConversationWindow } from "./ConversationWindow";
import { DiscoveryInput } from "./DiscoveryInput";

// // Context (tylko do użycia wewnętrznego)
// const DiscoveryContext = createContext<DiscoveryContextValue | null>(null);

// // Hook do dostępu do contextu
// export const useDiscovery = () => {
//   const context = useContext(DiscoveryContext);
//   if (!context) {
//     throw new Error("useDiscovery must be used within Discovery component");
//   }
//   return context;
// };

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
// DiscoveryRoot.MessageList = MessageList;
// DiscoveryRoot.MessageItem = MessageItem;

export const useDiscovery = useDiscoveryContext;
export const Discovery = DiscoveryRoot;
