// import typow dla ponizszych
// wywolac start endpoint
// wywolac answer endpoint

import { ClientRequest } from "@/lib/utils/makeClientRequest";
import type { DiscoverySessionRow } from "@/types";
interface StartDiscoveryRequest {
  initialDescription: string;
}
interface StartDiscoveryResponse {
  sessionId: string;
  questions: {
    id: string;
    question: string;
    context?: string;
    category: string;
    priority: number;
    round: number;
  }[];
  currentRound: number;
  status: string;
}

interface SubmitAnswerRequest {
  sessionId: string;
  questionId: string;
  answer: string;
}

interface SubmitAnswerResponse {
  complete: boolean;
  nextQuestions?: {
    id: string;
    question: string;
    context?: string;
    category: string;
    priority: number;
    round: number;
  }[];
  completenessScore?: number;
  currentRound: number;
  status: string;
}
export class DiscoveryClientService {
  private requestClient: ClientRequest;

  constructor(path: string) {
    this.requestClient = new ClientRequest(path);
  }

  async startDiscovery(data: StartDiscoveryRequest): Promise<StartDiscoveryResponse> {
    return this.requestClient.makeRequest<StartDiscoveryResponse>("start", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async submitAnswer(data: SubmitAnswerRequest): Promise<SubmitAnswerResponse> {
    return this.requestClient.makeRequest<SubmitAnswerResponse>("answer", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getSession(sessionId: string): Promise<DiscoverySessionRow> {
    return this.requestClient.makeRequest<DiscoverySessionRow>("session", {
      method: "GET",
      body: JSON.stringify(sessionId),
    });
  }
}
