import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import axios from "axios";
import { Eye, EyeOff, Car, Shield, Star, CheckCircle, Upload, ArrowRight, ArrowLeft, MapPin, FileText, ImageIcon, Clock } from "lucide-react";
import { Header } from "@/components/common/Header";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import LoginDialog from "@/components/common/Login";
import { useAuth } from "@/contexts/AuthContext";
import { useListingCount } from "@/hooks/useListingCount";
import { ListingLimitDialog } from "@/components/common/ListingLimitDialog";

enum CarCondition {
  NEW = "new",
  USED = "used",
  CERTIFIED = "certified"
}

const ImageUploadSection = ({ images, onImagesChange, onRemoveImage }: {
  images: File[];
  onImagesChange: (files: File[]) => void;
  onRemoveImage: (index: number) => void;
}) => {
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    const urls = images.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);

    return () => {
      urls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [images]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    onImagesChange([...images, ...files]);
  };

  return (
    <div className="space-y-4">
      <label className="text-sm font-medium mb-2 block">Car Images *</label>

      {previewUrls.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
          {previewUrls.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Preview ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
              />
              <button
                type="button"
                onClick={() => onRemoveImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-dealership-primary transition-colors">
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-2 font-medium">Upload car images</p>
        <p className="text-sm text-gray-500 mb-4">
          Drag & drop images or click to browse
        </p>
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          className="hidden"
          id="car-images"
          accept="image/*"
        />
        <label
          htmlFor="car-images"
          className="inline-flex items-center justify-center bg-dealership-primary text-white px-6 py-3 rounded-lg cursor-pointer hover:bg-dealership-primary/90 transition-colors"
        >
          <Upload className="w-4 h-4 mr-2" />
          Choose Files
        </label>
        <p className="text-xs text-gray-500 mt-3">
          {images.length > 0
            ? `${images.length} file(s) selected • PNG, JPG, JPEG up to 10MB each`
            : 'PNG, JPG, JPEG up to 10MB each'
          }
        </p>
      </div>
    </div>
  );
};

const SellYourCarPage = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showLimitDialog, setShowLimitDialog] = useState(false);

  const { listingCount, hasReachedLimit, isLoading: countLoading } = useListingCount();

  const [listing, setListing] = useState({
    min_price: "",
    price: "",
    body_type_id: "",
    color: "",
    model: "",
    mileage: "",
    make_id: "",
    seats: "",
    location: "",
    transmission_id: "",
    fuel_type_id: "",
    badge_id: "",
    engine_type: "",
    condition: CarCondition.USED,
    description: "",
    year: "",
    features: "",
    images: [] as File[],
  });

  const [contactInfo, setContactInfo] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [showDetailsPopup, setShowDetailsPopup] = useState(false);
  const [showFinalSuccess, setShowFinalSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setStep(2);
    }
  }, [user]);

  useEffect(() => {
    if (step === 2 && user && hasReachedLimit && !countLoading) {
      setShowLimitDialog(true);
    }
  }, [step, user, hasReachedLimit, countLoading]);


  const isFormDisabled = user && hasReachedLimit;

  const handleListingChange = (field: string, value: string) => setListing((p) => ({ ...p, [field]: value }));

  const handleImagesChange = (files: File[]) => {
    setListing((p) => ({ ...p, images: [...p.images, ...files] }));
  };

  const handleRemoveImage = (index: number) => {
    setListing((p) => ({
      ...p,
      images: p.images.filter((_, i) => i !== index)
    }));
  };



  const handleLoginSuccess = () => {
    setStep(2);
  };

  const handleStartSelling = () => {
    if (user) {
      setStep(2);
    } else {
      setStep(1);
    }
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDetailsPopup(false);
    setShowFinalSuccess(true);
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header />
      <Navbar />

      {step === 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Hero Section */}
          <div className="text-center mb-16 mt-20 md:mt-0">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Sell Your Car,<br />
              <span className="text-dealership-primary">The Smart Way</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Get the best value for your car with our premium selling platform.
              Thousands of buyers are waiting for your listing.
            </p>

            <Button
              onClick={handleStartSelling}
              className="bg-dealership-primary hover:bg-dealership-primary/90 text-white px-8 py-6 text-lg font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              Start Selling Now <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="text-center p-6 border-2 border-transparent hover:border-dealership-primary transition-all duration-300">
              <CardContent className="p-4">
                <div className="w-16 h-16 bg-dealership-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Car className="w-8 h-8 text-dealership-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Quick & Easy</h3>
                <p className="text-gray-600">List your car in minutes with our simple process</p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 border-2 border-transparent hover:border-dealership-primary transition-all duration-300">
              <CardContent className="p-4">
                <div className="w-16 h-16 bg-dealership-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-dealership-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Secure Process</h3>
                <p className="text-gray-600">Your data and transactions are completely secure</p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 border-2 border-transparent hover:border-dealership-primary transition-all duration-300">
              <CardContent className="p-4">
                <div className="w-16 h-16 bg-dealership-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-dealership-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Best Value</h3>
                <p className="text-gray-600">Get competitive offers from verified buyers</p>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="bg-dealership-primary rounded-2xl p-8 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Sell Your Car?</h2>
            <p className="text-blue-100 mb-6 text-lg">
              {user && hasReachedLimit
                ? "You've reached your listing limit. Upgrade to list more cars!"
                : "Join thousands of satisfied sellers who found the perfect buyer through our platform"
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleStartSelling}
                className={`px-8 py-6 text-lg font-semibold rounded-xl ${user && hasReachedLimit
                  ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                  : "bg-white text-dealership-primary hover:bg-gray-100"
                  }`}
              >
                {user && hasReachedLimit ? "Upgrade Account" : "List Your Car Now"}
              </Button>
              {!user && (
                <Button
                  onClick={() => setShowLoginDialog(true)}
                  className="px-8 py-6 text-lg font-semibold rounded-xl bg-white text-dealership-primary hover:bg-gray-100"

                >
                  Already a Seller? Login
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {step === 1 && !user && (
        <div className="max-w-xl mx-auto p-4 sm:p-6 space-y-6 mt-6">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-dealership-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-dealership-primary" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Your Contact Information</h2>
              <p className="text-gray-600 mt-1 text-sm">Just a few details to get started</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 ml-1">Full Name</label>
                <Input
                  placeholder="Enter your full name"
                  value={contactInfo.name}
                  onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })}
                  className="h-10 border-gray-200 focus:border-dealership-primary focus:ring-1 focus:ring-dealership-primary/20 rounded-lg text-sm px-3"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 ml-1">Email Address</label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={contactInfo.email}
                  onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                  className="h-10 border-gray-200 focus:border-dealership-primary focus:ring-1 focus:ring-dealership-primary/20 rounded-lg text-sm px-3"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 ml-1">Phone Number</label>
                <Input
                  placeholder="Enter your phone number"
                  value={contactInfo.phone}
                  onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                  className="h-10 border-gray-200 focus:border-dealership-primary focus:ring-1 focus:ring-dealership-primary/20 rounded-lg text-sm px-3"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setStep(0)}
                  className="flex-1 h-10 border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium"
                >
                  Back
                </Button>
                <Button
                  onClick={() => {
                    if (!contactInfo.name || !contactInfo.email || !contactInfo.phone) {
                      toast.error("Please fill in all fields");
                      return;
                    }
                    setStep(2);
                  }}
                  className="flex-1 h-10 bg-dealership-primary hover:bg-dealership-primary/90 text-white rounded-lg text-sm font-bold shadow-md shadow-dealership-primary/25"
                >
                  Continue
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="max-w-xl mx-auto p-4 sm:p-6 space-y-6 mt-6">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Upload Car Images</h2>
              <p className="text-gray-600 mt-1 text-sm">Clear photos help sell your car faster</p>
            </div>

            <div className="space-y-6">
              <ImageUploadSection
                images={listing.images}
                onImagesChange={handleImagesChange}
                onRemoveImage={handleRemoveImage}
              />

              {user && (
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                  <p className="text-blue-700 text-xs font-medium leading-relaxed italic text-center">
                    "If you don't have images yet fill the form and we will contact you after the submission"
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setStep(user ? 0 : 1)}
                  className="flex-1 h-10 border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setShowDetailsPopup(true)}
                  className="flex-1 h-10 bg-dealership-primary hover:bg-dealership-primary/90 text-white rounded-lg text-sm font-bold shadow-md shadow-dealership-primary/25"
                >
                  Next step
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Popup */}
      <Dialog open={showDetailsPopup} onOpenChange={setShowDetailsPopup}>
        <DialogContent className="max-w-[90%] sm:max-w-[360px] p-0 overflow-hidden rounded-xl border-none shadow-2xl">
          <div className="bg-dealership-primary px-4 py-3 text-white">
            <DialogHeader>
              <DialogTitle className="text-base font-bold">Car Details</DialogTitle>
              <DialogDescription className="text-blue-100 text-[10px] font-medium leading-tight">
                Quick technical details to proceed.
              </DialogDescription>
            </DialogHeader>
          </div>

          <form onSubmit={handleDetailsSubmit} className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Year *</label>
                <Input
                  required
                  type="number"
                  placeholder="2022"
                  value={listing.year}
                  onChange={(e) => handleListingChange("year", e.target.value)}
                  className="h-9 border-gray-200 rounded-md text-sm px-2"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Mileage</label>
                <Input
                  type="number"
                  placeholder="Km"
                  value={listing.mileage}
                  onChange={(e) => handleListingChange("mileage", e.target.value)}
                  className="h-9 border-gray-200 rounded-md text-sm px-2"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Engine</label>
              <Select value={listing.engine_type} onValueChange={(v) => handleListingChange("engine_type", v)}>
                <SelectTrigger className="h-9 border-gray-200 rounded-md text-sm px-2">
                  <SelectValue placeholder="Value" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="3cl">3 Cylinder</SelectItem>
                  <SelectItem value="4cl">4 Cylinder</SelectItem>
                  <SelectItem value="v5">V5</SelectItem>
                  <SelectItem value="v6">V6</SelectItem>
                  <SelectItem value="v8">V8</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Fuel Type *</label>
              <Select required value={listing.fuel_type_id} onValueChange={(v) => handleListingChange("fuel_type_id", v)}>
                <SelectTrigger className="h-9 border-gray-200 rounded-md text-sm px-2">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="gasoline">Gasoline</SelectItem>
                  <SelectItem value="diesel">Diesel</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="electric">Electric</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              className="w-full h-10 bg-dealership-primary hover:bg-dealership-primary/90 text-white rounded-md text-sm font-bold shadow-md mt-1"
            >
              Submit
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Final Success Popup */}
      <Dialog open={showFinalSuccess} onOpenChange={setShowFinalSuccess}>
        <DialogContent className="sm:max-w-[360px] text-center p-6 rounded-xl">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <DialogTitle className="text-xl font-bold text-gray-900 mb-1">
            Success!
          </DialogTitle>
          <p className="text-gray-600 text-sm leading-relaxed">
            Thanks for submitting the listings our representative will contact you soon to sell your car.
          </p>
          <Button
            onClick={() => {
              setShowFinalSuccess(false);
              setStep(0);
              // reset state
              setContactInfo({ name: "", email: "", phone: "" });
              setListing({
                ...listing,
                year: "",
                mileage: "",
                engine_type: "",
                fuel_type_id: "",
                images: []
              });
            }}
            className="w-full h-10 bg-dealership-primary hover:bg-dealership-primary/90 text-white rounded-lg font-bold mt-4"
          >
            Back to Home
          </Button>
        </DialogContent>
      </Dialog>

      <LoginDialog
        showLoginDialog={showLoginDialog}
        setShowLoginDialog={setShowLoginDialog}
        onSuccess={handleLoginSuccess}
        redirectPath="/sellcar"
      />

      <Footer />
    </div>
  );
};

export default SellYourCarPage;