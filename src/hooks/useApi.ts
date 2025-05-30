import { apiClient } from "@/lib/api-client";

/**
 * Custom hook for API calls with token expiration handling
 * @returns API utility functions
 */
export function useApi() {
  /**
   * GET request with token expiration handling
   * @param endpoint API endpoint
   * @param options Fetch options
   * @returns Promise with parsed JSON response
   */
  const get = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    const response = await apiClient(endpoint, {
      method: "GET",
      ...options,
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    
    return response.json();
  };

  /**
   * POST request with token expiration handling
   * @param endpoint API endpoint
   * @param data Request body data
   * @param options Fetch options
   * @returns Promise with parsed JSON response
   */
  const post = async <T>(endpoint: string, data: any, options: RequestInit = {}): Promise<T> => {
    const response = await apiClient(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
      ...options,
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    
    return response.json();
  };

  /**
   * PUT request with token expiration handling
   * @param endpoint API endpoint
   * @param data Request body data
   * @param options Fetch options
   * @returns Promise with parsed JSON response
   */
  const put = async <T>(endpoint: string, data: any, options: RequestInit = {}): Promise<T> => {
    const response = await apiClient(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
      ...options,
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    
    return response.json();
  };

  /**
   * DELETE request with token expiration handling
   * @param endpoint API endpoint
   * @param options Fetch options
   * @returns Promise with parsed JSON response
   */
  const del = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    const response = await apiClient(endpoint, {
      method: "DELETE",
      ...options,
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    
    return response.json();
  };

  return { get, post, put, del };
} 