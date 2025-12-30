import { useState, useEffect, useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, ArrowLeft, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";

interface SignupDialogProps {
    showDialog: boolean;
    setShowDialog: (open: boolean) => void;
    isModal?: boolean;
}

const SignupDialog = ({ showDialog, setShowDialog, isModal = false }: SignupDialogProps) => {
    const { signup, resendVerification } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [step, setStep] = useState(0);
    const steps = ["Basic Info", "Contact Details", "Address", "Password"];

    const [completedSteps, setCompletedSteps] = useState<number[]>([]);
    const progressBarRef = useRef(null);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [birthDate, setBirthDate] = useState("");

    const [phone1, setPhone1] = useState("");
    const [phone2, setPhone2] = useState("");
    const [whatsapp, setWhatsapp] = useState("");

    const [street, setStreet] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [country, setCountry] = useState("");
    const [postalCode, setPostalCode] = useState("");
    const [landmark, setLandmark] = useState("");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [showActivationNotice, setShowActivationNotice] = useState(false);
    const [lastSignedUpEmail, setLastSignedUpEmail] = useState("");

    useEffect(() => {
        if (step > 0 && !completedSteps.includes(step - 1)) {
            setCompletedSteps(prev => [...prev, step - 1]);
        }
    }, [step]);

    const handleDialogChange = (open: boolean) => {
        if (!open) {
            setFirstName("");
            setLastName("");
            setEmail("");
            setBirthDate("");
            setPhone1("");
            setPhone2("");
            setWhatsapp("");
            setStreet("");
            setCity("");
            setState("");
            setCountry("");
            setPostalCode("");
            setLandmark("");
            setPassword("");
            setConfirmPassword("");
            setStep(0);
            setCompletedSteps([]);

            if (isModal) {
                if (location.state?.background && !location.state?.isFallback) {
                    navigate(-1);
                } else {
                    navigate(location.state?.background?.pathname || "/", { replace: true });
                }
            } else {
                setShowDialog(open);
            }
        } else {
            setShowDialog(open);
        }
    };

    const validateStep = (stepIndex) => {
        switch (stepIndex) {
            case 0:
                if (!firstName.trim()) {
                    toast.error("First name is required");
                    return false;
                }
                if (!lastName.trim()) {
                    toast.error("Last name is required");
                    return false;
                }
                if (!email.trim()) {
                    toast.error("Email is required");
                    return false;
                }
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    toast.error("Please enter a valid email address");
                    return false;
                }
                return true;

            case 1:
                if (!phone1.trim()) {
                    toast.error("At least one phone number is required");
                    return false;
                }
                return true;

            case 2:
                if (!street.trim() || !city.trim() || !state.trim() || !country.trim()) {
                    toast.error("Please fill in all address fields");
                    return false;
                }
                return true;

            case 3:
                if (!password) {
                    toast.error("Password is required");
                    return false;
                }
                if (password.length < 6) {
                    toast.error("Password must be at least 6 characters");
                    return false;
                }
                if (password !== confirmPassword) {
                    toast.error("Passwords do not match");
                    return false;
                }
                return true;

            default:
                return true;
        }
    };

    const handleNext = () => {
        if (validateStep(step)) {
            setStep(step + 1);
        }
    };

    const handlePrev = () => {
        setStep(step - 1);
    };

    const handleStepClick = (stepIndex) => {
        if (stepIndex <= step || completedSteps.includes(stepIndex)) {
            let canNavigate = true;
            for (let i = 0; i < stepIndex; i++) {
                if (!completedSteps.includes(i) && !validateStep(i)) {
                    canNavigate = false;
                    break;
                }
            }
            if (canNavigate) {
                setStep(stepIndex);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateStep(3)) {
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                first_name: firstName,
                mid_name: "",
                last_name: lastName,
                email,
                user_name: email.split("@")[0],
                birth_date: birthDate,
                password,
                contact_detail: {
                    phone_no1: phone1,
                    phone_no2: phone2,
                    whatsapp_no: whatsapp,
                },
                address: {
                    street,
                    city,
                    state,
                    country,
                    postal_code: postalCode,
                    landmark,
                },
            };
            const response = await signup(payload);

            setShowDialog(false);
            setLastSignedUpEmail(email);
            setShowActivationNotice(true);
            setStep(0);
            setCompletedSteps([]);
        } catch (err) {
            console.error("Signup error ===>", err);
            const msg =
                err?.response?.data?.detail ||
                err?.message ||
                "Something went wrong. Please try again.";
            toast.error(typeof msg === "string" ? msg : JSON.stringify(msg));
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendEmail = async () => {
        try {
            if (!lastSignedUpEmail) return;
            await resendVerification(lastSignedUpEmail);
            toast.success("Verification email resent! Please check your inbox.");
        } catch (error) {
            toast.error("Failed to resend verification email.");
        }
    };

    const renderStep = () => {
        switch (step) {
            case 0:
                return (
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Basic Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                placeholder="First Name *"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="h-12"
                            />
                            <Input
                                placeholder="Last Name *"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="h-12"
                            />
                        </div>
                        <Input
                            type="email"
                            placeholder="Email *"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="h-12"
                        />
                        <Input
                            type="date"
                            placeholder="Birth Date"
                            value={birthDate}
                            onChange={(e) => setBirthDate(e.target.value)}
                            className="h-12"
                        />
                    </div>
                );

            case 1:
                return (
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Contact Details</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                placeholder="Phone No. 1 *"
                                value={phone1}
                                onChange={(e) => setPhone1(e.target.value)}
                                className="h-12"
                            />
                            <Input
                                placeholder="Phone No. 2"
                                value={phone2}
                                onChange={(e) => setPhone2(e.target.value)}
                                className="h-12"
                            />
                        </div>
                        <Input
                            placeholder="WhatsApp No."
                            value={whatsapp}
                            onChange={(e) => setWhatsapp(e.target.value)}
                            className="h-12"
                        />
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Address</h3>
                        <Input
                            placeholder="Street *"
                            value={street}
                            onChange={(e) => setStreet(e.target.value)}
                            className="h-12"
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                placeholder="City *"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="h-12"
                            />
                            <Input
                                placeholder="State *"
                                value={state}
                                onChange={(e) => setState(e.target.value)}
                                className="h-12"
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                placeholder="Country *"
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                className="h-12"
                            />
                            <Input
                                placeholder="Postal Code"
                                value={postalCode}
                                onChange={(e) => setPostalCode(e.target.value)}
                                className="h-12"
                            />
                        </div>
                        <Input
                            placeholder="Landmark"
                            value={landmark}
                            onChange={(e) => setLandmark(e.target.value)}
                            className="h-12"
                        />
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Password</h3>
                        <div className="relative">
                            <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password *"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="h-12 pr-10"
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        <div className="relative">
                            <Input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm Password *"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="h-12 pr-10"
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Password must be at least 6 characters long
                        </p>
                    </div>
                );

            default:
                return null;
        }
    };

    const getProgressPercentage = () => {
        const totalSteps = steps.length - 1;
        const progress = (completedSteps.length / totalSteps) * 100;
        return Math.min(progress, 100);
    };

    return (
        <>
            <Dialog open={showDialog} onOpenChange={handleDialogChange}>
                <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-center">
                            Create an Account
                        </DialogTitle>
                        <DialogDescription className="text-center">
                            Fill in your details below to get started
                        </DialogDescription>
                    </DialogHeader>
                    <div className="relative mb-8" ref={progressBarRef}>
                        <div className="absolute top-4 left-8 right-8 h-[2px] bg-gray-200 -z-0"></div>

                        <div
                            className="absolute top-4 left-8 h-[2px] bg-dealership-primary transition-all duration-300 -z-0"
                            style={{
                                width: `calc((100% - 4rem) * ${getProgressPercentage() / 100})`
                            }}
                        ></div>

                        <div className="flex justify-between items-center relative z-10">
                            {steps.map((stepLabel, index) => {
                                const isActive = index === step;
                                const isCompleted = completedSteps.includes(index) || index < step;
                                const isClickable = isCompleted || index <= step;

                                return (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => isClickable && handleStepClick(index)}
                                        className={`flex flex-col items-center transition-all ${isClickable ? 'cursor-pointer' : 'cursor-default'} relative`}
                                        disabled={!isClickable}
                                    >
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 relative z-20 ${isActive
                                                ? "bg-dealership-primary text-white ring-4 ring-dealership-primary/20"
                                                : isCompleted
                                                    ? "bg-dealership-primary text-white"
                                                    : "bg-gray-200 text-gray-500"
                                                }`}
                                        >
                                            {isCompleted ? "✓" : index + 1}
                                        </div>
                                        <span
                                            className={`text-xs mt-1 transition-colors whitespace-nowrap ${isActive || isCompleted
                                                ? "text-dealership-primary font-medium"
                                                : "text-gray-500"
                                                }`}
                                        >
                                            {stepLabel}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <form className="space-y-6 py-2" onSubmit={handleSubmit}>
                        {renderStep()}

                        <div className="flex gap-3 pt-4">
                            {step > 0 ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handlePrev}
                                    className="flex-1 h-12"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                                </Button>
                            ) : (
                                <div className="flex-1" />
                            )}

                            {step < steps.length - 1 ? (
                                <Button
                                    type="button"
                                    onClick={handleNext}
                                    className="flex-1 h-12 bg-dealership-primary hover:bg-dealership-primary/90 text-white"
                                >
                                    Next <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    className="flex-1 h-12 bg-dealership-primary hover:bg-dealership-primary/90 text-white"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Signing Up..." : "Sign Up"}
                                </Button>
                            )}
                        </div>

                        <p className="text-center text-sm text-gray-500">
                            Step {step + 1} of {steps.length}
                        </p>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={showActivationNotice} onOpenChange={setShowActivationNotice}>
                <DialogContent className="sm:max-w-[400px] text-center space-y-4">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold text-dealership-primary">
                            Verify Your Email
                        </DialogTitle>
                        <DialogDescription>
                            Your account has been created successfully!
                        </DialogDescription>
                    </DialogHeader>

                    <p className="text-sm text-gray-600">
                        Please check your email and click the activation link to complete your registration.
                    </p>
                    <button
                        onClick={handleResendEmail}
                        className="text-dealership-primary font-medium hover:underline text-sm"
                    >
                        Didn't receive an email? Resend Verification
                    </button>

                    <button
                        onClick={() => setShowActivationNotice(false)}
                        className="w-full bg-dealership-primary text-white font-medium py-2 rounded-xl"
                    >
                        Got It
                    </button>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default SignupDialog;