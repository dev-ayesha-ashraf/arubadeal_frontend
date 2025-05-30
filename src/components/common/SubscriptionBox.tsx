import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Mail, Check, Loader2 } from "lucide-react";

interface SubscriptionBoxProps {
  className?: string;
}

export const SubscriptionBox = ({ className = "" }: SubscriptionBoxProps) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Set that user has interacted with the form
    setHasInteracted(true);
    
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Call the subscription API endpoint
      const response = await fetch(`${import.meta.env.VITE_API_URL}/subscriptions/v1/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to subscribe");
      }
      
      const data = await response.json();
      
      // Success message
      toast({
        title: "Success!",
        description: data.message || "Thank you for subscribing to our newsletter",
      });
      
      // Set subscribed state and reset form
      setIsSubscribed(true);
      setEmail("");
      
      // Save to localStorage to remember this user subscribed
      localStorage.setItem("newsletter_subscribed", "true");
      localStorage.setItem("newsletter_email", email);
      
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to subscribe. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Check if user was already subscribed
  useState(() => {
    const wasSubscribed = localStorage.getItem("newsletter_subscribed") === "true";
    const savedEmail = localStorage.getItem("newsletter_email");
    
    if (wasSubscribed && savedEmail) {
      setIsSubscribed(true);
    }
  });

  return (
    <div className={`${className}`}>
      <h3 className="text-xl font-bold mb-4">Subscribe to Our Newsletter</h3>
      <p className="text-gray-100 mb-4">
        Stay updated with our latest vehicles and promotions.
      </p>
      
      {isSubscribed ? (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-4 flex items-center">
          <Check className="w-5 h-5 mr-2 text-green-600" />
          <p>You're subscribed to our newsletter! Thank you for joining.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-grow">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className={`
                w-full pl-10 py-2 px-4 rounded-md bg-white text-gray-800 border 
                focus:outline-none focus:ring-2 focus:ring-dealership-navy
                ${hasInteracted && !email ? 'border-red-500' : ''}
              `}
              disabled={isLoading}
              aria-label="Email address for newsletter subscription"
            />
            {hasInteracted && !email && (
              <p className="mt-1 text-red-500 text-sm">Email is required</p>
            )}
          </div>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="bg-dealership-navy hover:bg-dealership-navy/90 text-white px-6 py-2 rounded-md"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Subscribing...
              </>
            ) : "Subscribe"}
          </Button>
        </form>
      )}
      <div className="mt-2 text-xs text-gray-300">
        By subscribing, you agree to receive promotional emails. You can unsubscribe at any time.
      </div>
    </div>
  );
}; 