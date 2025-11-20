import { DiscoveryService } from "@/lib/services/langchain/discovery.service";

import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.supabase || !locals.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const { sessionId, questionId, answer } = await request.json();

  const discoveryService = new DiscoveryService(locals.supabase, locals.user);

  try {
    const session = await discoveryService.getSession(sessionId);

    if (!session?.current_round) {
      throw new Error("Missing session current_round");
    }

    const answerToQuestion = await discoveryService.saveAnswerForQuestion(
      sessionId,
      questionId,
      session?.current_round,
      answer
    );
    await discoveryService.saveAnswerToConversationLog(sessionId, answer, session.current_round);

    return new Response(
      JSON.stringify({
        sessionId,
        answerToQuestion,
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500 }
    );
  }
};
