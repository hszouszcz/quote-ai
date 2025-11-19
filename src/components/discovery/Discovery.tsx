import { createContext, useContext } from "react";

const DiscoveryContext = createContext<null>(null);

export const useDiscovery = () => {
  const context = useContext(DiscoveryContext);
  if (!context) {
    throw new Error("useDiscovery must be used within Discovery component");
  }
  return context;
};

interface DiscoveryProps {
  userId: string;
  sessionId?: string;
  onError?: (error: Error) => void;
  children: React.ReactNode;
}

const DiscoveryRoot = ({ userId, sessionId, children, onError }: DiscoveryProps) => {
  return {};
};
