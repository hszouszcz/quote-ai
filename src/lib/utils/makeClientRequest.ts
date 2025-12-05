class RequestClientError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = "DiscoveryClientError";
  }
}

export class ClientRequest {
  private path: string;
  constructor(path: string) {
    this.path = path;
  }

  makeRequest = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    try {
      const url = new URL(`${this.path}/${endpoint}`, window.location.origin);
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new RequestClientError(
          errorData.error || `Request failed: ${response.statusText}`,
          response.status,
          errorData.code
        );
      }

      return response.json();
    } catch (error) {
      if (error instanceof RequestClientError) throw error;
      throw new RequestClientError("Network error. Please check your connection.", 0, "NETWORK_ERROR");
    }
  };
}
