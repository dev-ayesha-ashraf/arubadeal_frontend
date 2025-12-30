import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import ResetPasswordDialog from "./ResetPasswordDialog";

interface LoginDialogProps {
  showLoginDialog: boolean;
  setShowLoginDialog: (open: boolean) => void;
  onSuccess?: () => void;
  redirectPath?: string;
  isModal?: boolean;
}

const LoginDialog = ({
  showLoginDialog,
  setShowLoginDialog,
  onSuccess,
  redirectPath,
  isModal = false
}: LoginDialogProps) => {
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showResendOption, setShowResendOption] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login, resendVerification, user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setErrorMessage("Please enter both email and password");
      return;
    }

    if (!isValidEmail(email)) {
      setErrorMessage("Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long");
      return;
    }

    setErrorMessage("");
    setIsLoading(true);

    try {
      const authenticatedUser = await login(email, password);
      setEmail("");
      setPassword("");
      setShowLoginDialog(false);

      if (onSuccess) onSuccess();

      if (redirectPath) {
        navigate(redirectPath);
      }
      else if (authenticatedUser.role === "admin" || authenticatedUser.role === "manager") {
        navigate("/profile");
      }
      else {
        if (isModal) {
          navigate(-1); 
        } else {
          navigate("/");
        }
      }


    } catch (error: any) {
      if (error.message?.includes("Account not verified")) {
        setErrorMessage(
          "Your account is not verified yet. Please check your email for a verification link."
        );
        setShowResendOption(true);
      } else {
        setErrorMessage(
          error?.message || "Login failed. Please check your credentials."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDialogChange = (open: boolean) => {
    if (!open) {
      setEmail("");
      setPassword("");
      setErrorMessage("");

      if (isModal) {
        if (location.state?.background && !location.state?.isFallback) {
          navigate(-1);
        } else {
          navigate(location.state?.background?.pathname || "/", { replace: true });
        }
      } else {
        setShowLoginDialog(open);
      }
    } else {
      setShowLoginDialog(open);
    }
  };

  const handleSignupClick = () => {
    let background = location.state?.background;
    let isFallback = false;

    if (!background || background.pathname === "/login" || background.pathname === "/signup") {
      background = { pathname: "/" };
      isFallback = true;
    }

    navigate("/signup", { state: { background, isFallback }, replace: true });
  };

  return (
    <>
      <Dialog open={showLoginDialog} onOpenChange={handleDialogChange}>
        <DialogContent className="sm:max-w-[425px]" aria-describedby="login-dialog-description">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center text-dealership-navy">
              Login
            </DialogTitle>
          </DialogHeader>

          <DialogDescription id="login-dialog-description" className="text-center">
            Enter your credentials to access your account
          </DialogDescription>

          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                className="text-dealership-primary font-medium hover:underline text-sm"
                onClick={() => {
                  setShowLoginDialog(false);
                  setShowResetDialog(true);
                }}
              >
                Forgot Password?
              </button>
            </div>

            {errorMessage && (
              <div className="text-center text-sm mt-2">
                <p className="text-red-600 font-medium mb-1">{errorMessage}</p>
                {showResendOption && (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await resendVerification(email);
                        setErrorMessage("Verification email sent! Please check your inbox.");
                        setShowResendOption(false);
                      } catch (err) {
                        setErrorMessage("Failed to resend verification email.");
                      }
                    }}
                    className="text-dealership-primary hover:underline font-medium"
                  >
                    Didn't receive an email? Resend Verification
                  </button>
                )}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-dealership-primary"
              disabled={isLoading}
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          <p className="text-center text-sm mt-2">
            Don't have an account?{" "}
            <button
              type="button"
              className="text-dealership-primary font-medium hover:underline"
              onClick={handleSignupClick}
            >
              Sign up
            </button>
          </p>
        </DialogContent>
      </Dialog>

      <ResetPasswordDialog
        showDialog={showResetDialog}
        setShowDialog={setShowResetDialog}
      />
    </>
  );
};

export default LoginDialog;