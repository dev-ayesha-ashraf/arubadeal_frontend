import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Custom fetch API wrapper that handles token expiration
 * @param endpoint The API endpoint to fetch
 * @param options Fetch options
 * @returns Response or error
 */
export async function apiClient(
  endpoint: string,
  options: RequestInit & { skipAuth?: boolean } = {}
): Promise<Response> {
  const url = endpoint.startsWith("http") ? endpoint : `${API_URL}${endpoint}`;

  const token = localStorage.getItem("access_token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers instanceof Headers
      ? Object.fromEntries(options.headers.entries())
      : Array.isArray(options.headers)
        ? Object.fromEntries(options.headers)
        : options.headers || {}),
  };

  if (!options.skipAuth && token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = { ...options, headers };

  try {
    const response = await fetch(url, config);

    if (response.status === 401 && !options.skipAuth) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      toast.error("Your session has expired. Please log in again.");
      window.location.href = "/";
      throw new Error("Token expired");
    }

    return response;
  } catch (error) {
    if (error instanceof Error && error.message === "Token expired") throw error;
    console.error("API request failed:", error);
    toast.error("Network error. Please try again later.");
    throw error;
  }
}
