/**
 * Ledger Decoupled API Client Singleton
 * Configurable via `NEXT_PUBLIC_API_URL` environment variable.
 * Easily switch between internal Next.js route handlers (/api) or external backend APIs.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export class ApiClient {
  private static getHeaders(): HeadersInit {
    return {
      "Content-Type": "application/json",
      Accept: "application/json",
      // Include authorization token header if plugged into external Auth service
      ...(typeof window !== "undefined" && localStorage.getItem("auth_token")
        ? { Authorization: `Bearer ${localStorage.getItem("auth_token")}` }
        : {}),
    };
  }

  static async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${BASE_URL}${endpoint}`, typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null) url.searchParams.append(key, val);
      });
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const errorJson = await response.json().catch(() => ({}));
      throw new Error(errorJson.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  static async post<T>(endpoint: string, body: any): Promise<T> {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorJson = await response.json().catch(() => ({}));
      throw new Error(errorJson.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  static async patch<T>(endpoint: string, body: any): Promise<T> {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorJson = await response.json().catch(() => ({}));
      throw new Error(errorJson.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  static async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const errorJson = await response.json().catch(() => ({}));
      throw new Error(errorJson.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  static getExportUrl(): string {
    return `${BASE_URL}/expenses/export`;
  }
}
