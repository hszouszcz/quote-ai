import { ListSessionsQueryParamsSchema } from "@/lib/schemas/session.schema";
import { SessionService } from "@/lib/services/sesssion.service";
import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ request, locals }) => {
  if (!locals.supabase || !locals.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  const url = new URL(request.url);
  const params = ListSessionsQueryParamsSchema.safeParse({
    userId: locals.user.id,
    page: url.searchParams.get("page") ? Number(url.searchParams.get("page")) : 1,
    limit: url.searchParams.get("limit") ? Number(url.searchParams.get("limit")) : 10,
    status: url.searchParams.get("status") || undefined,
    sortBy: url.searchParams.get("sortBy") || "created_at",
    sortOrder: url.searchParams.get("sortOrder") || "desc",
  });
  if (!params.success) {
    return new Response(JSON.stringify({ error: "Invalid query parameters" }), { status: 400 });
  }
  try {
    const sessionService = new SessionService(locals.supabase);
    const sessions = await sessionService.listSessionsByUser(params.data);

    return new Response(JSON.stringify(sessions), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to fetch sessions",
      }),
      { status: 500 }
    );
  }
};
