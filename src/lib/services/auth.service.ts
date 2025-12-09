import type { SupabaseClient } from "@/db/supabase.client";
import type { User } from "@supabase/supabase-js";

export class AuthError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export class AuthService {
  constructor(private readonly supabase: SupabaseClient) {}

  private handleAuthError(error: unknown): never {
    // Log error for debugging (consider using proper logging service in production)

    // Type guard for Supabase auth errors
    const authError = error as { message?: string };
    const errorMessage = authError?.message || "Unknown error";

    // Map Supabase auth errors to user-friendly messages
    switch (errorMessage) {
      case "Invalid login credentials":
        throw new AuthError("Nieprawidłowy email lub hasło", "INVALID_CREDENTIALS", 401);
      case "Email not confirmed":
        throw new AuthError("Email nie został potwierdzony", "EMAIL_NOT_CONFIRMED", 400);
      case "User already registered":
        throw new AuthError("Użytkownik z tym emailem już istnieje", "USER_EXISTS", 409);
      default:
        throw new AuthError("Wystąpił błąd podczas autoryzacji", "AUTH_ERROR", 500);
    }
  }

  async signIn(email: string, password: string): Promise<{ user: User }> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) this.handleAuthError(error);
      if (!data.user) throw new AuthError("Nie udało się zalogować", "NO_USER", 500);

      return { user: data.user };
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw new AuthError("Nieoczekiwany błąd podczas logowania", "UNEXPECTED_ERROR", 500);
    }
  }

  async signUp(email: string, password: string): Promise<{ user: User | null }> {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
      });

      if (error) this.handleAuthError(error);

      return { user: data.user };
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw new AuthError("Nieoczekiwany błąd podczas rejestracji", "UNEXPECTED_ERROR", 500);
    }
  }

  async signOut(): Promise<void> {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) this.handleAuthError(error);
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw new AuthError("Nieoczekiwany błąd podczas wylogowania", "UNEXPECTED_ERROR", 500);
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${import.meta.env.PUBLIC_SITE_URL}/auth/reset-password`,
      });

      if (error) this.handleAuthError(error);
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw new AuthError("Nieoczekiwany błąd podczas resetowania hasła", "UNEXPECTED_ERROR", 500);
    }
  }

  async updatePassword(newPassword: string): Promise<void> {
    try {
      const { error } = await this.supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) this.handleAuthError(error);
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw new AuthError("Nieoczekiwany błąd podczas zmiany hasła", "UNEXPECTED_ERROR", 500);
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const {
        data: { user },
        error,
      } = await this.supabase.auth.getUser();

      if (error) this.handleAuthError(error);
      return user;
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw new AuthError("Nieoczekiwany błąd podczas pobierania użytkownika", "UNEXPECTED_ERROR", 500);
    }
  }
}

// Factory function for creating AuthService instances
export function createAuthService(supabase: SupabaseClient): AuthService {
  return new AuthService(supabase);
}
