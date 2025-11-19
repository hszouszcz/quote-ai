import { createContext } from "react";
import type { DiscoveryContextValue } from "@/types/discovery.types";
import { DiscoveryService } from "@/lib/services/langchain/discovery.service";

const DiscoveryContext = createContext<DiscoveryContextValue | null>(null);

export const DiscoveryProvider = () => {
  const supabase = createSupabaseClient();
  const discoveryService = new DiscoveryService(locales, userId);
};
