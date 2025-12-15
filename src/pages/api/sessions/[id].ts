import { DiscoveryService } from "@/lib/services/langchain/discovery.service";
import { SessionService } from "@/lib/services/sesssion.service";
import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ params, locals }) => {
  if (!locals.supabase || !locals.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  if (!params.id) {
    return new Response(JSON.stringify({ error: "Session ID required" }), { status: 400 });
  }

  try {
    const sessionService = new SessionService(locals.supabase);
    const discoveryService = new DiscoveryService(locals.supabase, locals.user.id);
    const session = await sessionService.getSessionById(params.id, locals.user.id);
    const conversationLog = await discoveryService.getConversationHistoryForDiscoverySession(params.id);

    if (!session) {
      return new Response(JSON.stringify({ error: "Session not found" }), { status: 404 });
    }

    return new Response(JSON.stringify({ session, conversationLog }), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to fetch session",
      }),
      { status: 500 }
    );
  }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  if (!locals.supabase || !locals.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  if (!params.id) {
    return new Response(JSON.stringify({ error: "Session ID required" }), { status: 400 });
  }

  try {
    const sessionService = new SessionService(locals.supabase);
    await sessionService.deleteSession(params.id, locals.user.id);

    return new Response(null, { status: 204 });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to delete session",
      }),
      { status: 500 }
    );
  }
};
