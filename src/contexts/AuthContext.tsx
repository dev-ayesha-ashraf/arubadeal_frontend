import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useApi } from "@/hooks/useApi";
import { apiClient } from "@/lib/api-client";

interface User {
  id: string;
  name: string;
  image: string | null;
  email: string;
  phoneNo: string | null;
  city: string | null;
  address: string | null;
  role: number;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const api = useApi();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      // Only redirect if on home page and not already in admin/dealer portal
      // and if this is the main browser window (not opened from admin panel)
      const currentPath = window.location.pathname;
      const isOpenedFromAdminPanel = window.opener !== null;

      if (
        (currentPath === "/" || currentPath === "") &&
        !isOpenedFromAdminPanel
      ) {
        if (parsedUser.role === 1) {
          navigate("/admin");
        } else if (parsedUser.role === 2) {
          navigate("/dealer");
        }
      }
    }
  }, [navigate]);

  const login = async (email: string, password: string) => {
    try {
      // Call actual login API using our api client which handles token expiration
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/users/sign-in`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      if (!response.ok) {
        throw new Error("Invalid credentials");
      }

      const res = await response.json();

      setUser(res.data.user);
      localStorage.setItem(
        "access_token",
        JSON.stringify(res.data.access_token)
      );
      localStorage.setItem(
        "refresh_token",
        JSON.stringify(res.data.refresh_token)
      );
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // Redirect based on role and previous location
      const from = location.state?.from?.pathname || "/";
      if (res.data.user.role === 1) {
        // admin
        navigate("/admin");
      } else if (res.data.user.role === 2) {
        // dealer
        navigate("/dealer");
      } else {
        navigate(from);
      }

      toast.success("Logged in successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    navigate("/");
    toast.success("Logged out successfully");
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
    <AuthContext.Provider value={{ user, login, logout, forgotPassword }}>
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
