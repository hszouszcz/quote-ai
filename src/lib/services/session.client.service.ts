import type { DiscoveryConversationLogRow, DiscoverySessionRow, ListSessionsResult } from "@/types";
import { ClientRequest } from "../utils/makeClientRequest";
import type { ListSessionsQueryParams } from "../schemas/session.schema";

export class SessionClientService {
  private requestClient: ClientRequest;
  constructor() {
    this.requestClient = new ClientRequest("/api/sessions");
  }

  async getSessionById(
    sessionId: string
  ): Promise<{ session: DiscoverySessionRow; logs: DiscoveryConversationLogRow[] }> {
    return this.requestClient.makeRequest<{ session: DiscoverySessionRow; logs: DiscoveryConversationLogRow[] }>(
      "session",
      {
        method: "GET",
        body: JSON.stringify(sessionId),
      }
    );
  }

  async listSessionsByUser(params?: ListSessionsQueryParams): Promise<ListSessionsResult | null> {
    const queryParams = { ...params, limit: String(params?.limit), page: String(params?.page) };
    const queryString = params ? `?${new URLSearchParams(queryParams).toString()}` : "";
    return this.requestClient.makeRequest<ListSessionsResult | null>(`${queryString}`, {
      method: "GET",
    });
  }
}
