import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SignupDialog from "./Signup";

const LoginDialog = ({ showLoginDialog, setShowLoginDialog }) => {
  const [showSignupDialog, setShowSignupDialog] = useState(false);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
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
      await login(email, password);
      setEmail("");
      setPassword("");
      setShowLoginDialog(false);
    } catch (error) {
      setErrorMessage(
        error?.message || "Login failed. Please check your credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDialogChange = (open) => {
    if (!open) {
      setEmail("");
      setPassword("");
      setErrorMessage("");
    }
    setShowLoginDialog(open);
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
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
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
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
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

            {errorMessage && (
              <p className="text-sm font-medium text-red-600 text-center">
                {errorMessage}
              </p>
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

              onClick={() => {
                setShowLoginDialog(false);
                setShowSignupDialog(true);
              }}
            >
              Sign up
            </button>

          </p>
        </DialogContent>
      </Dialog>
      <SignupDialog
        showDialog={showSignupDialog}
        setShowDialog={setShowSignupDialog}
      />
    </>

  );
};

export default LoginDialog;