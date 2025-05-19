import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "@/lib/supabase";
import { z } from "zod";

export const prerender = false;

// Validation schema for password recovery request
const recoverPasswordSchema = z.object({
  email: z.string().email("Nieprawidłowy format adresu email"),
});

// Validation schema for password reset
const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Hasło musi mieć co najmniej 8 znaków")
    .regex(/[A-Z]/, "Hasło musi zawierać co najmniej jedną wielką literę")
    .regex(/[a-z]/, "Hasło musi zawierać co najmniej jedną małą literę")
    .regex(/[0-9]/, "Hasło musi zawierać co najmniej jedną cyfrę"),
});

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const result = recoverPasswordSchema.safeParse(body);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: "Nieprawidłowe dane",
          details: result.error.errors,
        }),
        { status: 400 }
      );
    }

    const { email } = result.data;
    const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${new URL(request.url).origin}/auth/reset-password`,
    });

    if (error) {
      console.error("Password recovery error:", error);
      return new Response(
        JSON.stringify({
          error: "Wystąpił błąd podczas wysyłania linku do resetowania hasła",
        }),
        { status: 400 }
      );
    }

    return new Response(
      JSON.stringify({
        message: "Link do resetowania hasła został wysłany na podany adres email",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Password recovery error:", error);
    return new Response(
      JSON.stringify({
        error: "Wystąpił nieoczekiwany błąd podczas resetowania hasła",
      }),
      { status: 500 }
    );
  }
};

// Endpoint for setting new password
export const PUT: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const result = resetPasswordSchema.safeParse(body);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: "Nieprawidłowe dane",
          details: result.error.errors,
        }),
        { status: 400 }
      );
    }

    const { password } = result.data;
    const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      console.error("Password update error:", error);
      return new Response(
        JSON.stringify({
          error: "Wystąpił błąd podczas aktualizacji hasła",
        }),
        { status: 400 }
      );
    }

    return new Response(
      JSON.stringify({
        message: "Hasło zostało pomyślnie zaktualizowane",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Password update error:", error);
    return new Response(
      JSON.stringify({
        error: "Wystąpił nieoczekiwany błąd podczas aktualizacji hasła",
      }),
      { status: 500 }
    );
  }
};
