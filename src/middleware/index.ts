import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerInstance } from "@/lib/supabase";

// Ścieżki publiczne - endpointy API Auth i strony Astro renderowane po stronie serwera
const PUBLIC_PATHS = [
  // Strony Astro renderowane po stronie serwera
  "/auth/login",
  "/auth/register",
  "/auth/recover-password",
  // Endpointy API Auth
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/recover-password",
];

export const onRequest = defineMiddleware(async ({ locals, cookies, url, request, redirect }, next) => {
  const supabase = createSupabaseServerInstance({
    cookies,
    headers: request.headers,
  });

  // Dodaj instancję Supabase do locals
  locals.supabase = supabase;

  // Pomijamy sprawdzanie autoryzacji dla ścieżek publicznych
  if (PUBLIC_PATHS.includes(url.pathname)) {
    return next();
  }

  // WAŻNE: Zawsze najpierw pobieramy sesję użytkownika przed innymi operacjami
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    console.log("Middleware: Processing user", user.id);

    // Sprawdź czy użytkownik istnieje w tabeli users, jeśli nie - utwórz go
    const { data: existingUser, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("id", user.id)
      .single();

    console.log("Middleware: User check result", { existingUser, userError });

    if (!existingUser) {
      console.log("Middleware: Creating user in users table");
      // Użytkownik nie istnieje w tabeli users, utwórz go używając upsert
      const { error: upsertError } = await supabase.from("users").upsert(
        {
          id: user.id,
          email: user.email || "",
          role: "user",
        },
        {
          onConflict: "id",
        }
      );

      if (upsertError) {
        console.error("Error upserting user in users table:", upsertError);
      } else {
        console.log("Middleware: User upserted successfully");
      }
    }

    locals.user = {
      email: user.email ?? null,
      id: user.id,
    };
    return next();
  }

  // Przekierowanie na stronę logowania dla chronionych ścieżek
  return redirect("/auth/login");
});
