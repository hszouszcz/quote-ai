import type { DiscoverySessionRow } from "@/types";
import { ClientRequest } from "../utils/makeClientRequest";
import type { ListSessionsQueryParams } from "../schemas/session.schema";
import type { ListSessionsResult } from "./sesssion.service";

export class SessionClientService {
  private requestClient: ClientRequest;
  constructor() {
    this.requestClient = new ClientRequest("/api/sessions");
  }

  async getSessionById(sessionId: string): Promise<DiscoverySessionRow | null> {
    return this.requestClient.makeRequest<DiscoverySessionRow | null>(`/${sessionId}`, {
      method: "GET",
    });
  }

  async listSessionsByUser(params?: ListSessionsQueryParams): Promise<ListSessionsResult | null> {
    const queryParams = { ...params, limit: String(params?.limit), page: String(params?.page) };
    const queryString = params ? `?${new URLSearchParams(queryParams).toString()}` : "";
    return this.requestClient.makeRequest<ListSessionsResult | null>(`${queryString}`, {
      method: "GET",
    });
  }
}
