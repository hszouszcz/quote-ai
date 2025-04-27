import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "@/lib/supabase";
import { registerSchema } from "@/lib/schemas/auth";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();

    // Walidacja danych wejściowych
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: "Nieprawidłowe dane rejestracji",
          details: result.error.errors,
        }),
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${new URL(request.url).origin}/auth/login?verified=true`,
      },
    });

    if (error) {
      return new Response(
        JSON.stringify({
          error:
            error.message === "User already registered"
              ? "Użytkownik o podanym adresie email już istnieje"
              : "Wystąpił błąd podczas rejestracji",
        }),
        { status: 400 }
      );
    }

    // Sprawdzenie czy email wymaga potwierdzenia
    const needsEmailConfirmation = data.user && !data.user.confirmed_at;

    return new Response(
      JSON.stringify({
        user: {
          id: data.user?.id,
          email: data.user?.email,
        },
        needsEmailConfirmation,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return new Response(JSON.stringify({ error: "Wystąpił błąd podczas rejestracji" }), { status: 500 });
  }
};
