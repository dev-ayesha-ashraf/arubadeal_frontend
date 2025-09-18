import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const SignupDialog = ({ showDialog, setShowDialog }) => {
    const { signup } = useAuth();

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
        }
        setShowDialog(open);
    };
    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!firstName || !lastName || !email || !password) {
            toast.error("Please fill in all required fields");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters");
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

            console.log("📤 Signup payload ===>", payload);

            const response = await signup(payload);

            console.log("✅ Signup response ===>", response);

            setShowDialog(false);
            toast.success("Account created! Please check your email to verify.");
        } catch (err: any) {
            console.error("❌ Signup error ===>", err);

            if (err.response) {
                console.error("⚠️ API Error Response:", err.response);

                if (err.response.data?.detail && Array.isArray(err.response.data.detail)) {
                    err.response.data.detail.forEach((d: any) => {
                        toast.error(`${d.loc?.join(" → ")}: ${d.msg}`);
                    });
                } else {
                    if (err.response) {
                        console.error("⚠️ API Error Data:", err.response.data);
                        toast.error(
                            typeof err.response.data === "string"
                                ? err.response.data
                                : JSON.stringify(err.response.data)
                        );
                    }

                }
            } else {
                console.error("⚠️ Unexpected error ===>", err.message);
                toast.error("Unexpected error: " + err.message);
            }
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <Dialog open={showDialog} onOpenChange={handleDialogChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center">
                        Create an Account
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        Fill in your details below to get started
                    </DialogDescription>
                </DialogHeader>

                {/* ✅ Form */}
                <form
                    className="grid gap-6 py-4"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmit(e);
                    }}
                >
                    {/* Basic Info */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-lg">Basic Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                placeholder="First Name"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                            />
                            <Input
                                placeholder="Last Name"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                            />
                        </div>
                        <Input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                       
                        <Input
                            type="date"
                            value={birthDate}
                            onChange={(e) => setBirthDate(e.target.value)}
                        />
                    </div>

                    {/* Contact */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-lg">Contact Details</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                placeholder="Phone No. 1"
                                value={phone1}
                                onChange={(e) => setPhone1(e.target.value)}
                            />
                            <Input
                                placeholder="Phone No. 2"
                                value={phone2}
                                onChange={(e) => setPhone2(e.target.value)}
                            />
                        </div>
                        <Input
                            placeholder="WhatsApp No."
                            value={whatsapp}
                            onChange={(e) => setWhatsapp(e.target.value)}
                        />
                    </div>

                    {/* Address */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-lg">Address</h3>
                        <Input
                            placeholder="Street"
                            value={street}
                            onChange={(e) => setStreet(e.target.value)}
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                placeholder="City"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                            />
                            <Input
                                placeholder="State"
                                value={state}
                                onChange={(e) => setState(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                placeholder="Country"
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                            />
                            <Input
                                placeholder="Postal Code"
                                value={postalCode}
                                onChange={(e) => setPostalCode(e.target.value)}
                            />
                        </div>
                        <Input
                            placeholder="Landmark"
                            value={landmark}
                            onChange={(e) => setLandmark(e.target.value)}
                        />
                    </div>

                    {/* Password */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-lg">Password</h3>
                        <div className="relative">
                            <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        <div className="relative">
                            <Input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                                onClick={() =>
                                    setShowConfirmPassword(!showConfirmPassword)
                                }
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                    <button
                        type="submit"
                        onClick={() => handleSubmit()} 
                        className="w-full bg-dealership-primary h-11 text-base rounded-xl"
                        disabled={isLoading}
                    >
                        {isLoading ? "Signing Up..." : "Sign Up"}
                    </button>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default SignupDialog;
