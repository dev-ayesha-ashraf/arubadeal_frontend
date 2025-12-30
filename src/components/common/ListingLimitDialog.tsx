// components/ListingLimitDialog.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield, Star, Mail } from "lucide-react";

interface ListingLimitDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    listingCount: number;
}

export const ListingLimitDialog = ({ open, onOpenChange, listingCount }: ListingLimitDialogProps) => {
    const handleContactSupport = () => {
        window.location.href = 'mailto:support@arudeal.com?subject=Account Upgrade Request&body=Hello, I would like to upgrade my account to list more cars.';
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] text-center space-y-4 rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-dealership-primary">
                        Listing Limit Reached
                    </DialogTitle>
                    <DialogDescription>
                        You have reached the maximum number of active listings
                    </DialogDescription>
                </DialogHeader>

                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-left">
                    <div className="flex items-start space-x-3">
                        <Star className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-sm text-yellow-800 font-medium">
                                Current Usage: {listingCount}/5 listings
                            </p>
                            <p className="text-sm text-yellow-700 mt-1">
                                You have reached the maximum of 5 listings. Please request the service team for an account upgrade to add more
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 pt-2">
                    <Button
                        onClick={() => onOpenChange(false)}
                        variant="outline"
                        className="flex-1 border-gray-300"
                    >
                        Close
                    </Button>
                    <Button
                        onClick={handleContactSupport}
                        disabled
                        className="flex-1 bg-dealership-primary/50 text-white font-medium cursor-not-allowed"
                    >
                        <Mail className="w-4 h-4 mr-2" />
                        Contact Support
                    </Button>

                </div>
            </DialogContent>
        </Dialog>
    );
};