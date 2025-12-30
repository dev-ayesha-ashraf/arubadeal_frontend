import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
} from "@/components/ui/select";

interface Make {
    id: string;
    name: string;
}

interface BodyType {
    id: string;
    name: string;
}

export const SubscriptionBox = () => {
    const [email, setEmail] = useState("");
    const [whatsapp, setWhatsapp] = useState("");
    const [make, setMake] = useState("");
    const [model, setModel] = useState("");
    const [budgetFrom, setBudgetFrom] = useState("");
    const [budgetTo, setBudgetTo] = useState("");
    const [yearFrom, setYearFrom] = useState("");
    const [yearTo, setYearTo] = useState("");
    const [bodyType, setBodyType] = useState("");
    const [channel, setChannel] = useState("All");
    const [isLoading, setIsLoading] = useState(false);
    
    const [makes, setMakes] = useState<Make[]>([]);
    const [bodyTypes, setBodyTypes] = useState<BodyType[]>([]);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    
    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const makesRes = await fetch(`${import.meta.env.VITE_API_URL}/make/get_all`);
                if (!makesRes.ok) throw new Error(`Makes API failed: ${makesRes.status}`);
                const makesData = await makesRes.json();
                setMakes(makesData);
                
                const bodyTypesRes = await fetch(`${import.meta.env.VITE_API_URL}/bodytype/get_all`);
                if (!bodyTypesRes.ok) throw new Error(`BodyTypes API failed: ${bodyTypesRes.status}`);
                const bodyTypesData = await bodyTypesRes.json();
                setBodyTypes(bodyTypesData);
                
                setIsDataLoaded(true);
                
            } catch (error) {
                console.error("Error fetching dropdown data:", error);
                toast.error("Failed to load filter options. Please refresh the page.");
                setIsDataLoaded(true);
            }
        };
        
        fetchDropdownData();
    }, []);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const requiredFields = [
            { value: email, field: "Email" },
            { value: whatsapp, field: "WhatsApp number" },
            { value: make, field: "Make" },
            { value: model, field: "Model" },
            { value: budgetFrom, field: "Minimum budget" },
            { value: budgetTo, field: "Maximum budget" },
            { value: yearFrom, field: "Minimum year" },
            { value: yearTo, field: "Maximum year" },
            { value: bodyType, field: "Body type" }
        ];

        const missingFields = requiredFields
            .filter(field => !field.value.trim())
            .map(field => field.field);

        if (missingFields.length > 0) {
            toast.error(`Please fill in all required fields: ${missingFields.join(", ")}`);
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error("Please enter a valid email address.");
            return;
        }

        const cleanWhatsapp = whatsapp.replace(/\D/g, '');
        if (cleanWhatsapp.length < 10) {
            toast.error("Please enter a valid WhatsApp number (at least 10 digits).");
            return;
        }

        const validateUUID = (uuid: string): boolean => {
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            return uuidRegex.test(uuid);
        };

        if (!validateUUID(make)) {
            toast.error("Invalid Make selection. Please select again.");
            return;
        }

        if (!validateUUID(bodyType)) {
            toast.error("Invalid Body Type selection. Please select again.");
            return;
        }

        const fromBudget = parseInt(budgetFrom);
        const toBudget = parseInt(budgetTo);
        
        if (isNaN(fromBudget) || isNaN(toBudget)) {
            toast.error("Please enter valid budget values.");
            return;
        }
        
        if (fromBudget < 0 || toBudget < 0) {
            toast.error("Budget values cannot be negative.");
            return;
        }
        
        if (fromBudget > toBudget) {
            toast.error("Maximum budget should be greater than minimum budget.");
            return;
        }
        
        if (fromBudget > 10000000 || toBudget > 10000000) {
            toast.error("Budget values are too high. Please enter reasonable amounts.");
            return;
        }
        
        const budgetRange = {
            from: fromBudget,
            to: toBudget
        };

        const fromYear = parseInt(yearFrom);
        const toYear = parseInt(yearTo);
        
        if (isNaN(fromYear) || isNaN(toYear)) {
            toast.error("Please enter valid year values.");
            return;
        }
        
        const currentYear = new Date().getFullYear();
        const minYear = 1900;
        
        if (fromYear < minYear || toYear < minYear) {
            toast.error(`Year cannot be earlier than ${minYear}.`);
            return;
        }
        
        if (fromYear > currentYear || toYear > currentYear) {
            toast.error("Year cannot be in the future.");
            return;
        }
        
        if (fromYear > toYear) {
            toast.error("Maximum year should be greater than minimum year.");
            return;
        }
        
        const yearRange = {
            from: fromYear,
            to: toYear
        };

        const requestBody: any = {
            email: email.trim(),
            whatsapp_no: cleanWhatsapp,
            make: make,
            model: model.trim(),
            budget_range: budgetRange,
            year_range: yearRange,
            body_type: bodyType,
            channel: channel
        };

        console.log('Sending subscription request:', {
            endpoint: `${import.meta.env.VITE_API_URL}/subscriptions/`,
            body: requestBody
        });

        try {
            setIsLoading(true);
            
            const response = await fetch(`${import.meta.env.VITE_API_URL}/subscriptions/`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            console.log('Response status:', response.status);
            
            let responseData;
            try {
                responseData = await response.json();
                console.log('Response data:', responseData);
            } catch (parseError) {
                console.error('Failed to parse response:', parseError);
                throw new Error('Server returned invalid response');
            }

            if (!response.ok) {
                if (response.status === 500) {
                    if (responseData?.detail?.includes("'NoneType' object has no attribute 'model_dump'")) {
                        toast.error("Server error: Invalid data reference. Please check your selections and try again.");
                    } else {
                        toast.error("Server error. Please try again later.");
                    }
                    return;
                }
                
                if (response.status === 422) {
                    const errorMsg = responseData?.detail || "Validation failed. Please check your inputs.";
                    toast.error(`Validation error: ${errorMsg}`);
                    return;
                }
                
                if (response.status === 400) {
                    const errorMsg = responseData?.detail || responseData?.message || "Invalid request.";
                    toast.error(`Error: ${errorMsg}`);
                    return;
                }
                
                if (response.status === 404) {
                    toast.error("Service not found. Please contact support.");
                    return;
                }
                
                throw new Error(responseData?.detail || responseData?.message || `Request failed with status ${response.status}`);
            }

            if (responseData?.success === true) {
                toast.success(responseData.detail || "Successfully subscribed!");
            } else if (responseData?.detail) {
                if (responseData.detail.includes("already subscribed")) {
                    toast.info(responseData.detail);
                } else {
                    toast.success(responseData.detail);
                }
            } else {
                toast.success("Successfully subscribed!");
            }

            setEmail("");
            setWhatsapp("");
            setMake("");
            setModel("");
            setBudgetFrom("");
            setBudgetTo("");
            setYearFrom("");
            setYearTo("");
            setBodyType("");
            setChannel("All");

        } catch (error) {
            console.error("Error creating subscription:", error);
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                toast.error("Network error. Please check your connection.");
            } else {
                toast.error(error instanceof Error ? error.message : "Failed to subscribe. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-dealership-primary to-dealership-primary/90 rounded-xl overflow-hidden shadow-xl border border-white/20">
            <div className="flex flex-col md:flex-row">
                <div className="md:w-1/2 relative">
                    <img
                        src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&h=400&q=80"
                        alt="Premium Car"
                        className="w-full h-48 md:h-full object-cover"
                    />
                </div>

                <div className="md:w-1/2 p-4 md:p-6 flex flex-col justify-center">
                    <div className="inline-flex items-center px-2 py-1 rounded-full bg-white/20 border border-white/30 mb-3">
                        <span className="text-white text-xs font-semibold">Subscribe</span>
                    </div>

                    <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
                        Drive <span className="bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">Exclusive</span>
                    </h2>

                    <p className="text-white/80 text-sm mb-4 leading-tight">
                        Unlock VIP luxury vehicles and early access to limited editions. Join the elite circle.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                            <style>
                                {`
                                .pr-1::-webkit-scrollbar {
                                    width: 6px;
                                }
                                .pr-1::-webkit-scrollbar-track {
                                    background: rgba(255, 255, 255, 0.1);
                                    border-radius: 10px;
                                }
                                .pr-1::-webkit-scrollbar-thumb {
                                    background: rgba(255, 255, 255, 0.3);
                                    border-radius: 10px;
                                }
                                .pr-1::-webkit-scrollbar-thumb:hover {
                                    background: rgba(255, 255, 255, 0.4);
                                }
                                `}
                            </style>

                            <input
                                type="email"
                                placeholder="Email address *"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white text-sm"
                                required
                                disabled={isLoading}
                            />

                            <input
                                type="tel"
                                placeholder="WhatsApp number *"
                                value={whatsapp}
                                onChange={(e) => setWhatsapp(e.target.value)}
                                className="w-full bg-black/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white text-sm"
                                required
                                disabled={isLoading}
                            />

                            <Select value={make} onValueChange={setMake} disabled={isLoading || !isDataLoaded}>
                                <SelectTrigger className="w-full bg-black/20 border border-white/30 rounded-lg px-3 py-2 text-white text-sm">
                                    <SelectValue placeholder={isDataLoaded ? "Select Make *" : "Loading makes..."} />
                                </SelectTrigger>
                                <SelectContent className="bg-white text-black shadow-md rounded-md max-h-60 overflow-y-auto">
                                    {makes.map((makeItem) => (
                                        <SelectItem key={makeItem.id} value={makeItem.id}>
                                            {makeItem.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <input
                                type="text"
                                placeholder="Model *"
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                                className="w-full bg-black/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white text-sm"
                                required
                                disabled={isLoading}
                            />

                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="number"
                                    placeholder="Min Budget *"
                                    value={budgetFrom}
                                    onChange={(e) => setBudgetFrom(e.target.value)}
                                    className="w-full bg-black/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white text-sm"
                                    min="0"
                                    required
                                    disabled={isLoading}
                                />
                                <input
                                    type="number"
                                    placeholder="Max Budget *"
                                    value={budgetTo}
                                    onChange={(e) => setBudgetTo(e.target.value)}
                                    className="w-full bg-black/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white text-sm"
                                    min="0"
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="number"
                                    placeholder="Min Year *"
                                    value={yearFrom}
                                    onChange={(e) => setYearFrom(e.target.value)}
                                    className="w-full bg-black/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white text-sm"
                                    min="1900"
                                    max={new Date().getFullYear()}
                                    required
                                    disabled={isLoading}
                                />
                                <input
                                    type="number"
                                    placeholder="Max Year *"
                                    value={yearTo}
                                    onChange={(e) => setYearTo(e.target.value)}
                                    className="w-full bg-black/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white text-sm"
                                    min="1900"
                                    max={new Date().getFullYear()}
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            <Select value={bodyType} onValueChange={setBodyType} disabled={isLoading || !isDataLoaded}>
                                <SelectTrigger className="w-full bg-black/20 border border-white/30 rounded-lg px-3 py-2 text-white text-sm">
                                    <SelectValue placeholder={isDataLoaded ? "Select Body Type *" : "Loading body types..."} />
                                </SelectTrigger>
                                <SelectContent className="bg-white text-black shadow-md rounded-md max-h-60 overflow-y-auto">
                                    {bodyTypes.map((bodyTypeItem) => (
                                        <SelectItem key={bodyTypeItem.id} value={bodyTypeItem.id}>
                                            {bodyTypeItem.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={channel} onValueChange={setChannel} disabled={isLoading}>
                                <SelectTrigger className="w-full bg-black/20 border border-white/30 rounded-lg px-3 py-2 text-white text-sm">
                                    <SelectValue placeholder="Select channel *" />
                                </SelectTrigger>
                                <SelectContent className="bg-white text-black shadow-md rounded-md">
                                    <SelectItem value="Email">Email</SelectItem>
                                    <SelectItem value="Whatsapp">Whatsapp</SelectItem>
                                    <SelectItem value="All">All</SelectItem>
                                </SelectContent>
                            </Select>

                            <p className="text-white/60 text-xs mt-1">* All fields are required</p>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !isDataLoaded}
                            className="w-full bg-white text-dealership-primary hover:bg-gray-100 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Subscribing..." : (!isDataLoaded ? "Loading..." : "Subscribe")}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};