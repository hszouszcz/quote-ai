// Frontend service for authentication
// This service handles communication with auth API endpoints

interface AuthResponse {
  user?: {
    id: string;
    email: string;
  };
  error?: string;
  details?: unknown[];
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials extends LoginCredentials {
  confirmPassword: string;
}

interface ResetPasswordData {
  password: string;
  confirmPassword: string;
}

export class AuthClientError extends Error {
  constructor(
    message: string,
    public status?: number,
    public details?: unknown[]
  ) {
    super(message);
    this.name = "AuthClientError";
  }
}

class AuthClientService {
  private async makeRequest(endpoint: string, data: unknown): Promise<AuthResponse> {
    try {
      const response = await fetch(`/api/auth/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result: AuthResponse = await response.json();

      if (!response.ok) {
        throw new AuthClientError(result.error || "Wystąpił błąd", response.status, result.details);
      }

      return result;
    } catch (error) {
      if (error instanceof AuthClientError) throw error;

      throw new AuthClientError("Wystąpił błąd połączenia z serwerem", 500);
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return this.makeRequest("login", credentials);
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    if (credentials.password !== credentials.confirmPassword) {
      throw new AuthClientError("Hasła nie są identyczne", 400);
    }

    // Remove confirmPassword from the data sent to API
    const registerData = { email: credentials.email, password: credentials.password };
    return this.makeRequest("register", registerData);
  }

  async logout(): Promise<void> {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        const result = await response.json();
        throw new AuthClientError(result.error || "Wystąpił błąd podczas wylogowania");
      }
    } catch (error) {
      if (error instanceof AuthClientError) throw error;
      throw new AuthClientError("Wystąpił błąd połączenia z serwerem");
    }
  }

  async recoverPassword(email: string): Promise<void> {
    const result = await this.makeRequest("recover-password", { email });

    if (result.error) {
      throw new AuthClientError(result.error);
    }
  }

  async resetPassword(data: ResetPasswordData): Promise<void> {
    if (data.password !== data.confirmPassword) {
      throw new AuthClientError("Hasła nie są identyczne", 400);
    }

    // Remove confirmPassword from the data sent to API
    const resetData = { password: data.password };
    const result = await this.makeRequest("reset-password", resetData);

    if (result.error) {
      throw new AuthClientError(result.error);
    }
  }
}

// Export singleton instance
export const authClientService = new AuthClientService();
