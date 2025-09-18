import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useApi } from "@/hooks/useApi";
import { apiClient } from "@/lib/api-client";

export interface UserRole {
  role_id: string;
  site_id?: string | null;
  user_id: string;
}


export interface User {
  id: string;
  name: string;
  image: string | null;
  email: string;
  phoneNo: string | null;
  city: string | null;
  address: string | null;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  signup: (payload: any) => Promise<void>;
  verify: (token: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
}


const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const api = useApi();
  let inactivityTimer: NodeJS.Timeout;


  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    navigate("/");
    toast.success("Logged out successfully");
  }, [navigate]);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
      toast.info("Logged out due to inactivity");
      logout();
    }, 15 * 60 * 1000);
  }, [logout]);
  useEffect(() => {
    const events = ["mousemove", "keydown", "click", "scroll"];
    events.forEach((event) => window.addEventListener(event, resetInactivityTimer));

    resetInactivityTimer();

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetInactivityTimer));
      if (inactivityTimer) clearTimeout(inactivityTimer);
    };
  }, [resetInactivityTimer]);
  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    const storedUser = localStorage.getItem("user");

    if (accessToken && storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    }
  }, []);

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    const storedUser = localStorage.getItem("user");

    if (accessToken && storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      const currentPath = window.location.pathname;
      const isOpenedFromAdminPanel = window.opener !== null;

      if ((currentPath === "/" || currentPath === "") && !isOpenedFromAdminPanel) {
        if (parsedUser.role === "admin") {
          navigate("/");
        } else if (parsedUser.role === "dealer") {
          navigate("/dealer");
        }
      }
    }
  }, [navigate]);


  const signup = async (payload: any) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL1}/v1/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Signup failed");
      }

      const data = await response.json();

      await fetch(
        `${import.meta.env.VITE_API_URL1}/v1/auth/resend-verification?email=${encodeURIComponent(payload.email)}`,
        { method: "POST" }
      );

      toast.success("Account created! Please check your email for verification link.");
      return data;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Signup failed");
      throw error;
    }
  };


  const verify = async (token: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL1}/v1/auth/verify?token=${token}`
      );
      if (!response.ok) {
        throw new Error("Verification failed");
      }
      toast.success("Email verified successfully! You can now login.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Verification failed");
      throw error;
    }
  };

  const resendVerification = async (email: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL1}/v1/auth/resend-verification?email=${email}`,
        { method: "POST" }
      );
      if (!response.ok) {
        throw new Error("Failed to resend verification");
      }
      toast.success("Verification email sent again!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Resend failed");
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL1}/v1/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      if (!response.ok) {
        throw new Error("Invalid credentials");
      }

      const res = await response.json();

      localStorage.setItem("access_token", res.access_token);
      localStorage.setItem("refresh_token", res.refresh_token);

      const userResponse = await fetch(
        `${import.meta.env.VITE_API_URL1}/me`,
        {
          headers: {
            Authorization: `Bearer ${res.access_token}`,
          },
        }
      );

      if (!userResponse.ok) {
        throw new Error("Failed to fetch user profile");
      }

      const user = await userResponse.json();
      setUser(user);
      localStorage.setItem("user", JSON.stringify(user));
      navigate("/profile");
      toast.success("Logged in successfully");


      toast.success("Logged in successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
      throw error;
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Password reset link sent to your email");
    } catch (error) {
      toast.error("Failed to send reset link");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        forgotPassword,
        signup,
        verify,
        resendVerification
      }}
    >
      {children}
    </AuthContext.Provider>

  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
