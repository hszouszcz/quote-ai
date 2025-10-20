import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerInstance } from "@/lib/supabase";
import { errorReporter } from "@/lib/errors";

// Ścieżki publiczne - endpointy API Auth i strony Astro renderowane po stronie serwera
const PUBLIC_PATHS = [
  // Strony Astro renderowane po stronie serwera
  "/auth/login",
  "/auth/register",
  "/auth/recover-password",
  "/auth/reset-password",
  // Endpointy API Auth
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/recover-password",
];

export const onRequest = defineMiddleware(async ({ locals, cookies, url, request, redirect }, next) => {
  try {
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    // Dodaj instancję Supabase do locals
    locals.supabase = supabase;

    // Debug: log czy middleware się wykonuje
    if (url.pathname.startsWith("/api/")) {
      // eslint-disable-next-line no-console
      console.log(`[MIDDLEWARE] ${url.pathname} - supabase:`, !!supabase);
    }

    // Pomijamy sprawdzanie autoryzacji dla ścieżek publicznych
    if (PUBLIC_PATHS.includes(url.pathname)) {
      return next();
    }

    // WAŻNE: Zawsze najpierw pobieramy sesję użytkownika przed innymi operacjami
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // Użytkownik jest zalogowany - przekaż dane do locals
      locals.user = {
        email: user.email || "",
        id: user.id,
      };
      return next();
    }

    // Przekierowanie na stronę logowania dla chronionych ścieżek
    return redirect("/auth/login");
  } catch (error) {
    // Log middleware errors
    errorReporter.reportUnexpectedError(error, {
      url: request.url,
      method: request.method,
      userAgent: request.headers.get("user-agent"),
      middleware: "authMiddleware",
    });

    // For auth errors, redirect to login
    return redirect("/auth/login");
  }
});
