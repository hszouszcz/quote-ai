import type { SupabaseClient, User } from "@supabase/supabase-js";
import { AuthenticationError, DatabaseError, InternalServerError } from "../errors/base";
import { handleAsyncOperation, errorReporter } from "../errors";

/**
 * Enhanced AuthService with proper error handling
 */
export class AuthService {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Handle Supabase auth errors and convert to appropriate AppError
   */
  private handleSupabaseAuthError(error: unknown): never {
    // Type guard for Supabase auth errors
    const authError = error as { message?: string; status?: number };
    const errorMessage = authError?.message || "Unknown authentication error";

    // Log the original error for debugging
    errorReporter.reportError(new AuthenticationError(errorMessage), {
      originalError: error,
      service: "AuthService",
    });

    // Map Supabase auth errors to user-friendly messages
    switch (errorMessage) {
      case "Invalid login credentials":
        throw new AuthenticationError("Nieprawidłowy email lub hasło");
      case "Email not confirmed":
        throw new AuthenticationError("Email nie został potwierdzony");
      case "User already registered":
        throw new AuthenticationError("Użytkownik z tym emailem już istnieje");
      case "Signup rate limit exceeded":
        throw new AuthenticationError("Przekroczono limit prób rejestracji. Spróbuj ponownie później");
      case "Signups not allowed for otp":
        throw new AuthenticationError("Rejestracja jest tymczasowo niedostępna");
      default:
        throw new AuthenticationError("Wystąpił błąd podczas autoryzacji");
    }
  }

  async signIn(email: string, password: string): Promise<{ user: User }> {
    return handleAsyncOperation(
      async () => {
        const { data, error } = await this.supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          this.handleSupabaseAuthError(error);
        }

        if (!data.user) {
          throw new AuthenticationError("Nie udało się zalogować");
        }

        return { user: data.user };
      },
      { operation: "signIn", email }
    );
  }

  async signUp(email: string, password: string): Promise<{ user: User | null }> {
    return handleAsyncOperation(
      async () => {
        const { data, error } = await this.supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          this.handleSupabaseAuthError(error);
        }

        return { user: data.user };
      },
      { operation: "signUp", email }
    );
  }

  async signOut(): Promise<void> {
    return handleAsyncOperation(
      async () => {
        const { error } = await this.supabase.auth.signOut();
        if (error) {
          this.handleSupabaseAuthError(error);
        }
      },
      { operation: "signOut" }
    );
  }

  async resetPassword(email: string): Promise<void> {
    return handleAsyncOperation(
      async () => {
        const redirectUrl = `${import.meta.env.PUBLIC_SITE_URL}/auth/reset-password`;
        const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
          redirectTo: redirectUrl,
        });

        if (error) {
          this.handleSupabaseAuthError(error);
        }
      },
      { operation: "resetPassword", email }
    );
  }

  async updatePassword(newPassword: string): Promise<void> {
    return handleAsyncOperation(
      async () => {
        const { error } = await this.supabase.auth.updateUser({
          password: newPassword,
        });

        if (error) {
          this.handleSupabaseAuthError(error);
        }
      },
      { operation: "updatePassword" }
    );
  }

  async getCurrentUser(): Promise<User | null> {
    return handleAsyncOperation(
      async () => {
        const {
          data: { user },
          error,
        } = await this.supabase.auth.getUser();

        if (error) {
          this.handleSupabaseAuthError(error);
        }

        return user;
      },
      { operation: "getCurrentUser" }
    );
  }

  /**
   * Verify if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      return user !== null;
    } catch {
      return false;
    }
  }

  /**
   * Get user session
   */
  async getSession() {
    return handleAsyncOperation(
      async () => {
        const {
          data: { session },
          error,
        } = await this.supabase.auth.getSession();

        if (error) {
          throw new DatabaseError("Failed to get session", "getSession", {
            originalError: error,
          });
        }

        return session;
      },
      { operation: "getSession" }
    );
  }
}

/**
 * Factory function for creating AuthService instances
 */
export function createAuthService(supabase: SupabaseClient): AuthService {
  if (!supabase) {
    throw new InternalServerError("Supabase client is required to create AuthService");
  }
  
  return new AuthService(supabase);
}