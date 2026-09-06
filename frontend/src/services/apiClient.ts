const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1";

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  private async getAuthToken(): Promise<string | null> {
    if (typeof window !== "undefined") {
      return localStorage.getItem("animalsetu_auth_token") || "demo-token";
    }
    return null;
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, headers, ...customConfig } = options;

    let url = `${this.baseUrl}/${endpoint.replace(/^\//, "")}`;

    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    const token = await this.getAuthToken();

    const defaultHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    if (token) {
      defaultHeaders["Authorization"] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...customConfig,
      headers: {
        ...defaultHeaders,
        ...headers,
      },
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      let errorMessage = `HTTP error ${response.status}: ${response.statusText}`;
      let errorData: unknown = null;
      try {
        errorData = await response.json();
        if (errorData && typeof errorData === "object" && "message" in errorData) {
          errorMessage = String((errorData as { message: unknown }).message);
        }
      } catch {
        // Response wasn't JSON
      }
      throw new ApiError(errorMessage, response.status, errorData);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  post<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data instanceof FormData ? data : JSON.stringify(data),
      headers:
        data instanceof FormData
          ? { ...(options?.headers || {}) } // let browser set multipart boundary
          : options?.headers,
    });
  }

  put<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  patch<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
