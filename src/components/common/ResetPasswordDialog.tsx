import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const ResetPasswordDialog = ({ showDialog, setShowDialog }) => {
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleReset = async (e) => {
        e.preventDefault();

        if (!email || !newPassword || !confirmPassword) {
            setErrorMessage("All fields are required");
            return;
        }

        if (newPassword !== confirmPassword) {
            setErrorMessage("Passwords do not match");
            return;
        }

        if (newPassword.length < 6) {
            setErrorMessage("Password must be at least 6 characters long");
            return;
        }

        setErrorMessage("");
        setIsLoading(true);

        try {
            const API_BASE = import.meta.env.VITE_API_URL1;

            const params = new URLSearchParams({
                email,
                new_password: newPassword,
                confirm_password: confirmPassword,
            });

            const response = await fetch(`${API_BASE}/v1/auth/reset_password?${params.toString()}`, {
                method: "POST",
                headers: {
                    "accept": "application/json",
                },
            });


            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Failed to reset password");
            }

            setSuccessMessage("Password reset successful! You can now login.");
            setEmail("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error) {
            setErrorMessage(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDialogChange = (open) => {
        if (!open) {
            setEmail("");
            setNewPassword("");
            setConfirmPassword("");
            setErrorMessage("");
            setSuccessMessage("");
        }
        setShowDialog(open);
    };

    return (
        <Dialog open={showDialog} onOpenChange={handleDialogChange}>
            <DialogContent className="sm:max-w-[425px]" aria-describedby="reset-password-dialog-description">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center text-dealership-navy">
                        Reset Password
                    </DialogTitle>
                </DialogHeader>
                <DialogDescription id="reset-password-dialog-description" className="text-center">
                    Enter your email and new password
                </DialogDescription>

                <form onSubmit={handleReset} className="grid gap-4 py-4">
                    <Input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                    />
                    <Input
                        type="password"
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        autoComplete="new-password"
                    />
                    <Input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        autoComplete="new-password"
                    />

                    {errorMessage && <p className="text-red-600 text-sm text-center">{errorMessage}</p>}
                    {successMessage && <p className="text-green-600 text-sm text-center">{successMessage}</p>}

                    <Button type="submit" className="w-full bg-dealership-primary" disabled={isLoading}>
                        {isLoading ? "Resetting..." : "Reset Password"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ResetPasswordDialog;
