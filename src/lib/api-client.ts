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
  options: RequestInit = {}
): Promise<Response> {
  // Get the full URL
  const url = endpoint.startsWith("http") ? endpoint : `${API_URL}${endpoint}`;
  
  // Get token from localStorage
  const token = localStorage.getItem("access_token");
  
  // Set default headers
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${JSON.parse(token)}` }),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    
    // Handle token expiration (401 Unauthorized)
    if (response.status === 401) {
      // Remove stored credentials
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      
      // Show toast message
      toast.error("Your session has expired. Please log in again.");
      
      // Redirect to home page
      window.location.href = "/";
      
      // Throw error to break out of any further processing
      throw new Error("Token expired");
    }
    
    return response;
  } catch (error) {
    // If it's our token expiration error, just re-throw it
    if (error instanceof Error && error.message === "Token expired") {
      throw error;
    }
    
    // For other errors, we want to give a more generic message
    console.error("API request failed:", error);
    toast.error("Network error. Please try again later.");
    throw error;
  }
} 