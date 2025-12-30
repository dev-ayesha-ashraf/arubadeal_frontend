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

  const [dropdowns, setDropdowns] = useState({
    makes: [],
    bodyTypes: [],
    transmissions: [],
    fuelTypes: [],
    badges: []
  });

  const [seller, setSeller] = useState({
    first_name: "",
    mid_name: "",
    last_name: "",
    email: "",
    user_name: "",
    birth_date: "",
    password: "",
    confirm_password: "",
    contact_detail: {
      phone_no1: "",
      phone_no2: "",
      whatsapp_no: "",
    },
    address: {
      street: "",
      city: "",
      state: "",
      country: "",
      postal_code: "",
      landmark: "",
    },
  });

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

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const baseURL = import.meta.env.VITE_API_URL;
        const [makesRes, bodyTypesRes, transmissionsRes, fuelTypesRes, badgesRes] = await Promise.all([
          axios.get(`${baseURL}/make/get_all`),
          axios.get(`${baseURL}/bodytype/get_all`),
          axios.get(`${baseURL}/transmission/get_all`),
          axios.get(`${baseURL}/fueltype/get_all`),
          axios.get(`${baseURL}/badge/get_all`)
        ]);

        setDropdowns({
          makes: makesRes.data,
          bodyTypes: bodyTypesRes.data,
          transmissions: transmissionsRes.data,
          fuelTypes: fuelTypesRes.data,
          badges: badgesRes.data
        });
      } catch (error) {
        console.error("Error fetching dropdowns:", error);
      }
    };

    fetchDropdowns();
  }, []);

  const isFormDisabled = user && hasReachedLimit;

  const handleSellerChange = (field: string, value: string) => setSeller((p) => ({ ...p, [field]: value }));
  const handleNestedChange = (group: string, field: string, value: string) =>
    setSeller((p) => ({ ...p, [group]: { ...p[group], [field]: value } }));
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

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!seller.first_name || !seller.last_name || !seller.email) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        first_name: seller.first_name,
        mid_name: seller.mid_name,
        last_name: seller.last_name,
        email: seller.email,
        user_name: seller.email.split("@")[0],
        birth_date: seller.birth_date,
        contact_detail: seller.contact_detail,
        address: seller.address,
      };

      const baseURL = import.meta.env.VITE_API_URL;
      await axios.post(`${baseURL}/seller_listing/sign-up`, payload);

      toast.success("Signup successful!");
      setShowEmailPopup(true);
    } catch (err: any) {
      console.error("Signup error:", err);
      toast.error(err?.response?.data?.detail || "Failed to create account.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleListingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isFormDisabled) {
      setShowLimitDialog(true);
      return;
    }

    const requiredFields = [
      'model', 'make_id', 'price', 'year', 'body_type_id',
      'mileage', 'location', 'transmission_id', 'fuel_type_id'
    ];

    const missingFields = requiredFields.filter(field => !listing[field as keyof typeof listing]);
    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    if (listing.min_price && parseFloat(listing.min_price) >= parseFloat(listing.price)) {
      toast.error("Minimum price must be less than the asking price");
      return;
    }

    if (listing.images.length === 0) {
      toast.error("Please upload at least one image of your car");
      return;
    }

    const formData = new FormData();

    formData.append('min_price', listing.min_price || '0');
    formData.append('price', listing.price);
    formData.append('body_type_id', listing.body_type_id);
    formData.append('color', listing.color || '');
    formData.append('model', listing.model);
    formData.append('mileage', listing.mileage);
    formData.append('make_id', listing.make_id);
    formData.append('seats', listing.seats || '5');
    formData.append('location', listing.location);
    formData.append('transmission_id', listing.transmission_id);
    formData.append('fuel_type_id', listing.fuel_type_id);
    formData.append('badge_id', listing.badge_id || '');
    formData.append('engine_type', listing.engine_type || '');
    formData.append('condition', listing.condition);
    formData.append('description', listing.description || '');
    formData.append('year', listing.year);
    formData.append('features', listing.features || '');

    listing.images.forEach((file) => {
      formData.append('images', file);
    });

    const baseURL = import.meta.env.VITE_API_URL;
    setIsLoading(true);

    try {
      const token = localStorage.getItem('access_token');

      if (!token && !user) {
        toast.error("Authentication required. Please login again.");
        return;
      }

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
      };

      const response = await axios.post(
        `${baseURL}/seller_listing/create`,
        formData,
        config
      );

      console.log("Listing created successfully:", response.data);
      toast.success("Car listed successfully!");
      setShowSuccessPopup(true);

      setListing({
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
        images: [],
      });

    } catch (err: any) {
      console.error("Listing error:", err);

      if (err.response?.status === 422) {
        const errorData = err.response.data;

        if (Array.isArray(errorData.detail)) {
          const errorMessages = errorData.detail.map((error: any) =>
            `${error.loc && error.loc[1] ? error.loc[1] : 'Field'}: ${error.msg}`
          );
          toast.error(`Validation errors: ${errorMessages.join(', ')}`);
        } else if (typeof errorData.detail === 'string') {
          toast.error(errorData.detail);
        } else if (errorData.message) {
          toast.error(errorData.message);
        } else {
          toast.error("Please check all required fields and try again.");
        }
      } else {
        const errorMessage = err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to create listing. Please try again.";
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    setStep(2);
  };

  const handleStartSelling = () => {
    if (user) {
      if (hasReachedLimit) {
        setShowLimitDialog(true);
      } else {
        setStep(2);
      }
    } else {
      setStep(1);
    }
  };

  const DisabledFormOverlay = () => (
    <div className="absolute inset-0 bg-white bg-opacity-95 rounded-2xl flex items-center justify-center z-10 p-6">
      <div className="text-center max-w-sm">
        <Shield className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Listing Limit Reached
        </h3>
        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
          You have reached the maximum of 5 listings. Please request the service team for an account upgrade to add more.
        </p>
        <Button
          onClick={() => setShowLimitDialog(true)}
          className="bg-dealership-primary hover:bg-dealership-primary/90 text-white px-5 py-2 text-sm"
        >
          Upgrade Account
        </Button>
      </div>
    </div>
  );

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

      {step > 0 && (
        <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-8">
          {!user && (
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-dealership-primary text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                    1
                  </div>
                  <span className={`font-medium ${step >= 1 ? 'text-dealership-primary' : 'text-gray-500'}`}>
                    Account Details
                  </span>
                </div>

                <div className="flex-1 h-1 bg-gray-200 mx-4">
                  <div
                    className="h-1 bg-dealership-primary transition-all duration-300"
                    style={{ width: step >= 2 ? '100%' : '0%' }}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-dealership-primary text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                    2
                  </div>
                  <span className={`font-medium ${step >= 2 ? 'text-dealership-primary' : 'text-gray-500'}`}>
                    Car Details
                  </span>
                </div>
              </div>
            </div>
          )}

          {step === 1 && !user && (
            <form onSubmit={handleSignupSubmit} className="space-y-6 bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-dealership-primary">Create Seller Account</h2>
                <p className="text-gray-600 mt-2">Fill in your details to get started</p>

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => setShowLoginDialog(true)}
                    className="text-dealership-primary hover:underline font-medium"
                  >
                    Already have a seller account? Login
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Input
                    placeholder="First Name *"
                    value={seller.first_name}
                    onChange={(e) => handleSellerChange("first_name", e.target.value)}
                    className="h-12 border-gray-300 focus:border-dealership-primary"
                  />
                </div>
                <div>
                  <Input
                    placeholder="Last Name *"
                    value={seller.last_name}
                    onChange={(e) => handleSellerChange("last_name", e.target.value)}
                    className="h-12 border-gray-300 focus:border-dealership-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  placeholder="Middle Name"
                  value={seller.mid_name}
                  onChange={(e) => handleSellerChange("mid_name", e.target.value)}
                  className="h-12 border-gray-300 focus:border-dealership-primary"
                />
                <Input
                  type="date"
                  value={seller.birth_date}
                  onChange={(e) => handleSellerChange("birth_date", e.target.value)}
                  className="h-12 border-gray-300 focus:border-dealership-primary"
                />
              </div>

              <Input
                type="email"
                placeholder="Email *"
                value={seller.email}
                onChange={(e) => handleSellerChange("email", e.target.value)}
                className="h-12 border-gray-300 focus:border-dealership-primary"
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  placeholder="Phone No. 1"
                  value={seller.contact_detail.phone_no1}
                  onChange={(e) => handleNestedChange("contact_detail", "phone_no1", e.target.value)}
                  className="h-12 border-gray-300 focus:border-dealership-primary"
                />
                <Input
                  placeholder="Phone No. 2"
                  value={seller.contact_detail.phone_no2}
                  onChange={(e) => handleNestedChange("contact_detail", "phone_no2", e.target.value)}
                  className="h-12 border-gray-300 focus:border-dealership-primary"
                />
                <Input
                  placeholder="WhatsApp No."
                  value={seller.contact_detail.whatsapp_no}
                  onChange={(e) => handleNestedChange("contact_detail", "whatsapp_no", e.target.value)}
                  className="h-12 border-gray-300 focus:border-dealership-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  placeholder="Street"
                  value={seller.address.street}
                  onChange={(e) => handleNestedChange("address", "street", e.target.value)}
                  className="h-12 border-gray-300 focus:border-dealership-primary"
                />
                <Input
                  placeholder="City"
                  value={seller.address.city}
                  onChange={(e) => handleNestedChange("address", "city", e.target.value)}
                  className="h-12 border-gray-300 focus:border-dealership-primary"
                />
                <Input
                  placeholder="State"
                  value={seller.address.state}
                  onChange={(e) => handleNestedChange("address", "state", e.target.value)}
                  className="h-12 border-gray-300 focus:border-dealership-primary"
                />
                <Input
                  placeholder="Country"
                  value={seller.address.country}
                  onChange={(e) => handleNestedChange("address", "country", e.target.value)}
                  className="h-12 border-gray-300 focus:border-dealership-primary"
                />
                <Input
                  placeholder="Postal Code"
                  value={seller.address.postal_code}
                  onChange={(e) => handleNestedChange("address", "postal_code", e.target.value)}
                  className="h-12 border-gray-300 focus:border-dealership-primary"
                />
                <Input
                  placeholder="Landmark"
                  value={seller.address.landmark}
                  onChange={(e) => handleNestedChange("address", "landmark", e.target.value)}
                  className="h-12 border-gray-300 focus:border-dealership-primary"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(0)}
                  className="flex-1 h-12 border-gray-300"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-12 bg-dealership-primary hover:bg-dealership-primary/90 text-white font-medium rounded-xl"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account..." : "Create Account & Continue"}
                </Button>
              </div>
            </form>
          )}

          {step === 2 && (
            <div className={`max-w-4xl mx-auto px-4 sm:px-8 ${isFormDisabled ? 'h-[50vh]' : ''}`}>
              <div className={`relative bg-white p-6 sm:p-8 rounded-2xl shadow-lg ${isFormDisabled ? 'h-full overflow-hidden' : ''}`}>
                {isFormDisabled && <DisabledFormOverlay />}

                <form
                  onSubmit={handleListingSubmit}
                  className={`space-y-8 ${isFormDisabled ? 'opacity-50' : ''}`}
                >
                  {/* Header Section - Reduced margin */}
                  <div className="text-center mb-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-dealership-primary">
                      {user ? "List Your Car" : "Car Listing Details"}
                    </h2>
                    <p className="text-gray-600 mt-1 text-sm sm:text-base">
                      {user ? "Welcome back! List your car for sale" : "Tell us about your car"}
                    </p>
                    {user && (
                      <p className="text-xs sm:text-sm text-green-600 mt-1">
                        ✓ You're logged in as {user.email}
                      </p>
                    )}
                  </div>

                  {user && listingCount >= 3 && listingCount < 5 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                      <div className="flex items-center space-x-2 text-yellow-800">
                        <Shield className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm font-medium">
                          You have {listingCount}/5 listings. {5 - listingCount} listing(s) remaining.
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 flex items-center">
                      <Car className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-dealership-primary" />
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {/* Make */}
                      <div>
                        <label className="text-sm font-medium mb-1 block">Make *</label>
                        <Select value={listing.make_id} onValueChange={(v) => handleListingChange("make_id", v)}>
                          <SelectTrigger className="h-10 sm:h-12 border-gray-300 focus:border-dealership-primary bg-white text-sm">
                            <SelectValue placeholder="Select Make" />
                          </SelectTrigger>
                          <SelectContent className="max-h-60 overflow-y-auto bg-white">
                            {dropdowns.makes.map((make: any) => (
                              <SelectItem key={make.id} value={make.id}>
                                {make.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Model */}
                      <div>
                        <label className="text-sm font-medium mb-1 block">Model *</label>
                        <Input
                          placeholder="Model *"
                          value={listing.model}
                          onChange={(e) => handleListingChange("model", e.target.value)}
                          className="h-10 sm:h-12 border-gray-300 focus:border-dealership-primary bg-white text-sm"
                        />
                      </div>

                      {/* Year */}
                      <div>
                        <label className="text-sm font-medium mb-1 block">Year *</label>
                        <Input
                          placeholder="Year *"
                          type="number"
                          min="1990"
                          max={new Date().getFullYear() + 1}
                          value={listing.year}
                          onChange={(e) => handleListingChange("year", e.target.value)}
                          className="h-10 sm:h-12 border-gray-300 focus:border-dealership-primary bg-white text-sm"
                        />
                      </div>

                      {/* Condition */}
                      <div>
                        <label className="text-sm font-medium mb-1 block">Condition *</label>
                        <Select value={listing.condition} onValueChange={(v) => handleListingChange("condition", v)}>
                          <SelectTrigger className="h-10 sm:h-12 border-gray-300 focus:border-dealership-primary bg-white text-sm">
                            <SelectValue placeholder="Select Condition" />
                          </SelectTrigger>
                          <SelectContent className="max-h-60 overflow-y-auto bg-white">
                            <SelectItem value={CarCondition.NEW}>New</SelectItem>
                            <SelectItem value={CarCondition.USED}>Used</SelectItem>
                            <SelectItem value={CarCondition.CERTIFIED}>Certified</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Color */}
                      <div>
                        <label className="text-sm font-medium mb-1 block">Color</label>
                        <Input
                          placeholder="Color"
                          value={listing.color}
                          onChange={(e) => handleListingChange("color", e.target.value)}
                          className="h-10 sm:h-12 border-gray-300 focus:border-dealership-primary bg-white text-sm"
                        />
                      </div>

                      {/* Mileage */}
                      <div>
                        <label className="text-sm font-medium mb-1 block">Mileage *</label>
                        <Input
                          placeholder="Mileage (km)"
                          type="number"
                          value={listing.mileage}
                          onChange={(e) => handleListingChange("mileage", e.target.value)}
                          className="h-10 sm:h-12 border-gray-300 focus:border-dealership-primary bg-white text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 flex items-center">
                      <Star className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-dealership-primary" />
                      Pricing
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {/* Price */}
                      <div>
                        <label className="text-sm font-medium mb-1 block">Asking Price *</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                          <Input
                            placeholder="0.00"
                            type="number"
                            value={listing.price}
                            onChange={(e) => handleListingChange("price", e.target.value)}
                            className="h-10 sm:h-12 border-gray-300 focus:border-dealership-primary bg-white pl-8 text-sm"
                          />
                        </div>
                      </div>

                      {/* Minimum Price */}
                      <div>
                        <label className="text-sm font-medium mb-1 block">Minimum Acceptable Price</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                          <Input
                            placeholder="0.00"
                            type="number"
                            value={listing.min_price}
                            onChange={(e) => handleListingChange("min_price", e.target.value)}
                            className="h-10 sm:h-12 border-gray-300 focus:border-dealership-primary bg-white pl-8 text-sm"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          The lowest price you're willing to accept
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 flex items-center">
                      <Shield className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-dealership-primary" />
                      Technical Specifications
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {/* Body Type */}
                      <div>
                        <label className="text-sm font-medium mb-1 block">Body Type *</label>
                        <Select value={listing.body_type_id} onValueChange={(v) => handleListingChange("body_type_id", v)}>
                          <SelectTrigger className="h-10 sm:h-12 border-gray-300 focus:border-dealership-primary bg-white text-sm">
                            <SelectValue placeholder="Select Body Type" />
                          </SelectTrigger>
                          <SelectContent className="max-h-60 overflow-y-auto bg-white">
                            {dropdowns.bodyTypes.map((type: any) => (
                              <SelectItem key={type.id} value={type.id}>
                                {type.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Transmission */}
                      <div>
                        <label className="text-sm font-medium mb-1 block">Transmission *</label>
                        <Select value={listing.transmission_id} onValueChange={(v) => handleListingChange("transmission_id", v)}>
                          <SelectTrigger className="h-10 sm:h-12 border-gray-300 focus:border-dealership-primary bg-white text-sm">
                            <SelectValue placeholder="Select Transmission" />
                          </SelectTrigger>
                          <SelectContent className="max-h-60 overflow-y-auto bg-white">
                            {dropdowns.transmissions.map((transmission: any) => (
                              <SelectItem key={transmission.id} value={transmission.id}>
                                {transmission.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Fuel Type */}
                      <div>
                        <label className="text-sm font-medium mb-1 block">Fuel Type *</label>
                        <Select value={listing.fuel_type_id} onValueChange={(v) => handleListingChange("fuel_type_id", v)}>
                          <SelectTrigger className="h-10 sm:h-12 border-gray-300 focus:border-dealership-primary bg-white text-sm">
                            <SelectValue placeholder="Select Fuel Type" />
                          </SelectTrigger>
                          <SelectContent className="max-h-60 overflow-y-auto bg-white">
                            {dropdowns.fuelTypes.map((fuelType: any) => (
                              <SelectItem key={fuelType.id} value={fuelType.id}>
                                {fuelType.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Engine Type */}
                      <div>
                        <label className="text-sm font-medium mb-1 block">Engine Type</label>
                        <Input
                          placeholder="e.g., 2.0L Turbo"
                          value={listing.engine_type}
                          onChange={(e) => handleListingChange("engine_type", e.target.value)}
                          className="h-10 sm:h-12 border-gray-300 focus:border-dealership-primary bg-white text-sm"
                        />
                      </div>

                      {/* Seats */}
                      <div>
                        <label className="text-sm font-medium mb-1 block">Seats</label>
                        <Input
                          placeholder="Number of seats"
                          type="number"
                          min="1"
                          max="20"
                          value={listing.seats}
                          onChange={(e) => handleListingChange("seats", e.target.value)}
                          className="h-10 sm:h-12 border-gray-300 focus:border-dealership-primary bg-white text-sm"
                        />
                      </div>

                      {/* Badge */}
                      <div>
                        <label className="text-sm font-medium mb-1 block">Badge/Trim</label>
                        <Select value={listing.badge_id} onValueChange={(v) => handleListingChange("badge_id", v)}>
                          <SelectTrigger className="h-10 sm:h-12 border-gray-300 focus:border-dealership-primary bg-white text-sm">
                            <SelectValue placeholder="Select Badge" />
                          </SelectTrigger>
                          <SelectContent className="max-h-60 overflow-y-auto bg-white">
                            {dropdowns.badges.map((badge: any) => (
                              <SelectItem key={badge.id} value={badge.id}>
                                {badge.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 flex items-center">
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-dealership-primary" />
                      Location
                    </h3>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Location *</label>
                      <Input
                        placeholder="City, State"
                        value={listing.location}
                        onChange={(e) => handleListingChange("location", e.target.value)}
                        className="h-10 sm:h-12 border-gray-300 focus:border-dealership-primary bg-white text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Where is the car located?
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 flex items-center">
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-dealership-primary" />
                      Description & Features
                    </h3>
                    <div className="space-y-3">
                      {/* Description */}
                      <div>
                        <label className="text-sm font-medium mb-1 block">Description</label>
                        <textarea
                          placeholder="Describe your car's condition, history, features, and any other relevant details..."
                          value={listing.description}
                          onChange={(e) => handleListingChange("description", e.target.value)}
                          className="w-full border border-gray-300 rounded-lg p-3 focus:border-dealership-primary focus:outline-none min-h-[100px] bg-white text-sm"
                          rows={3}
                        />
                      </div>

                      {/* Features */}
                      <div>
                        <label className="text-sm font-medium mb-1 block">Features</label>
                        <Input
                          placeholder="e.g., Sunroof, Leather Seats, Navigation, Backup Camera"
                          value={listing.features}
                          onChange={(e) => handleListingChange("features", e.target.value)}
                          className="h-10 sm:h-12 border-gray-300 focus:border-dealership-primary bg-white text-sm"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Separate features with commas
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 flex items-center">
                      <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-dealership-primary" />
                      Car Images
                    </h3>
                    <ImageUploadSection
                      images={listing.images}
                      onImagesChange={handleImagesChange}
                      onRemoveImage={handleRemoveImage}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    {!user && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep(1)}
                        className="flex-1 h-10 sm:h-12 border-gray-300 text-sm"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                      </Button>
                    )}
                    <Button
                      type="submit"
                      className={`${user ? 'w-full' : 'flex-1'} h-10 sm:h-12 bg-dealership-primary hover:bg-dealership-primary/90 text-white font-semibold text-sm`}
                      disabled={isLoading || isFormDisabled}
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Listing Your Car...
                        </>
                      ) : (
                        'List My Car'
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Email Verification Popup */}
      <Dialog open={showEmailPopup} onOpenChange={setShowEmailPopup}>
        <DialogContent className="sm:max-w-[425px] text-center space-y-4 rounded-2xl">
          <DialogHeader>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <DialogTitle className="text-xl font-semibold text-dealership-primary">
              Verify Your Email
            </DialogTitle>
            <DialogDescription>
              Your account has been created successfully!
            </DialogDescription>
          </DialogHeader>

          <p className="text-sm text-gray-600">
            Please check your email and click the activation link to complete your registration.
            You'll also receive your login details shortly.
          </p>

          <Button
            onClick={() => {
              setShowEmailPopup(false);
              if (user) {
                setStep(2);
              } else {
                setShowLoginDialog(true);
                toast.info("Please log in to continue your car listing.");
              }
            }}
            className="w-full bg-dealership-primary hover:bg-dealership-primary/90 text-white font-medium py-3 rounded-xl"
          >
            Continue to Car Listing
          </Button>

        </DialogContent>
      </Dialog>

      {/* Success Popup */}
      <Dialog open={showSuccessPopup} onOpenChange={setShowSuccessPopup}>
        <DialogContent className="sm:max-w-[425px] text-center space-y-4 rounded-2xl">
          <DialogHeader>
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
            <DialogTitle className="text-xl font-semibold text-dealership-primary">
              Listing Submitted!
            </DialogTitle>
            <DialogDescription>
              Your car listing has been received and is pending approval.
            </DialogDescription>
          </DialogHeader>

          <p className="text-sm text-gray-600">
            Thank you for listing your car with <strong>Aruba Quality Deal Service</strong>!
            Our team is currently reviewing your submission to ensure it meets our quality
            standards. Once approved, your listing will go live and be visible to potential buyers.
            You'll receive an email notification as soon as it's published.
          </p>

          <div className="flex gap-3">
            <Button
              onClick={() => {
                setShowSuccessPopup(false);
                setStep(0);
              }}
              variant="outline"
              className="flex-1 border-gray-300"
            >
              Back to Home
            </Button>
            <Button
              onClick={() => {
                setShowSuccessPopup(false);
                window.location.href = '/my-listings';
              }}
              className="flex-1 bg-dealership-primary hover:bg-dealership-primary/90 text-white"
            >
              View My Listings
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Listing Limit Dialog */}
      <ListingLimitDialog
        open={showLimitDialog}
        onOpenChange={setShowLimitDialog}
        listingCount={listingCount}
      />

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