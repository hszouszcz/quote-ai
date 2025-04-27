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
  // Pomijamy sprawdzanie autoryzacji dla ścieżek publicznych
  if (PUBLIC_PATHS.includes(url.pathname)) {
    return next();
  }

  const supabase = createSupabaseServerInstance({
    cookies,
    headers: request.headers,
  });

  // WAŻNE: Zawsze najpierw pobieramy sesję użytkownika przed innymi operacjami
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    locals.user = {
      email: user.email ?? null,
      id: user.id,
    };
    return next();
  }

  // Przekierowanie na stronę logowania dla chronionych ścieżek
  return redirect("/auth/login");
});
