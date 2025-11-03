import { useState } from "react";

export const SubscriptionBox = () => {
    const [email, setEmail] = useState("");
    const [whatsapp, setWhatsapp] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!email && !whatsapp) {
            alert("Please enter at least Email or WhatsApp number to continue.");
            return;
        }

        console.log("Subscribed with:", { email, whatsapp });
        alert("Thank you for subscribing");
        setEmail("");
        setWhatsapp("");
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
                        <div className="space-y-2">
                            <div className="relative">
                                <input
                                    type="email"
                                    placeholder="Email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-black/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent text-sm"
                                />
                            </div>
                            
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="WhatsApp number"
                                    value={whatsapp}
                                    onChange={(e) => setWhatsapp(e.target.value)}
                                    className="w-full bg-black/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent text-sm"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-white text-dealership-primary hover:bg-gray-100 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                            Subscribe
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};