import type { APIRoute } from "astro";
import { DiscoveryService } from "@/lib/services/langchain/discovery.service";

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.supabase || !locals.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const { initialDescription } = await request.json();

  const discoveryService = new DiscoveryService(locals.supabase, locals.user.id);

  try {
    const session = await discoveryService.startDiscovery(initialDescription);

    const questions = await discoveryService.getQuestionsForRound(
      session.id,
      session.current_round,
      initialDescription
    );
    return new Response(
      JSON.stringify({
        sessionId: session.id,
        questions: questions.map((q) => ({
          id: q.id,
          question: q.question_text,
          context: q.context,
          category: q.category,
          priority: q.priority,
          round: q.round_number,
        })),
        currentRound: session.current_round,
        status: session.status,
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
