import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

export const useAuth = () => {
  const navigate = useNavigate();

  const logout = useCallback(() => {
    // Clear all auth-related data
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    
    // Redirect to login
    navigate('/');
  }, [navigate]);

  const isAuthenticated = useCallback(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return false;

    try {
      // Check if token is expired
      const tokenData = JSON.parse(token);
      const tokenExpiry = tokenData?.expiry;
      if (!tokenExpiry) return false;

      return new Date().getTime() < tokenExpiry;
    } catch (error) {
      return false;
    }
  }, []);

  return {
    logout,
    isAuthenticated,
  };
}; 