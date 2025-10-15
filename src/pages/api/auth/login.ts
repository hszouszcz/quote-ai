import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "@/lib/supabase";
import { loginSchema } from "@/lib/schemas/auth";
import { createAuthService, AuthError } from "@/lib/services/auth.service";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();

    // Walidacja danych wejściowych
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: "Nieprawidłowe dane logowania",
          details: result.error.errors,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { email, password } = result.data;

    const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });
    const authService = createAuthService(supabase);

    const { user } = await authService.signIn(email, password);

    return new Response(
      JSON.stringify({
        user: {
          id: user.id,
          email: user.email,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: error.status || 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Wystąpił nieprzewidziany błąd podczas logowania" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
