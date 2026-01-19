import { useState } from "react";
import { Header } from "@/components/common/Header";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  CheckCircle2,
  Check,
  ChevronRight,
  Shield,
  Zap,
  FileText,
  AlertCircle,
  MessageCircle,
  Mail,
  DollarSign,
} from "lucide-react";
import { CarfaxPackage, CarfaxFormData, CarfaxOrder } from "@/types/carfax";

const CARFAX_PACKAGES: CarfaxPackage[] = [
  {
    id: "standard",
    name: "STANDARD",
    description: "1 Car History Report",
    price: 44.99,
    pricePerReport: 44.99,
    reportCount: 1,
    badge: undefined,
    features: [
      "Complete vehicle history",
      "Accident and damage records",
      "Ownership history",
      "Title information",
      "Service records",
      "Mileage verification",
    ],
  },
  {
    id: "two-reports",
    name: "SAVE $30",
    description: "2 Car History Reports",
    price: 59.99,
    pricePerReport: 30.00,
    reportCount: 2,
    badge: "Best Value",
    features: [
      "All Standard features",
      "Best for comparing two cars",
      "Save $30 vs buying separately",
      "Complete vehicle history per report",
      "Accident and damage records",
      "Ownership history",
    ],
    popular: true,
  },
  {
    id: "four-reports",
    name: "SAVE $70",
    description: "4 Car History Reports",
    price: 109.99,
    pricePerReport: 27.50,
    reportCount: 4,
    badge: "Best for Dealers",
    features: [
      "All Standard features",
      "Best for comparing multiple cars",
      "Save $70 vs buying separately",
      "Complete vehicle history per report",
      "Accident and damage records",
      "Bulk pricing advantage",
    ],
  },
];

const PAYMENT_METHODS = [
  { id: "credit_card", label: "Credit Card", icon: "💳" },
  { id: "debit_card", label: "Debit Card", icon: "🏧" },
  { id: "paypal", label: "PayPal", icon: "🅿️" },
];

export default function CarfaxSalesPage() {
  const [currentStep, setCurrentStep] = useState<"select" | "details" | "confirmation">("select");
  const [formData, setFormData] = useState<CarfaxFormData>({
    packageId: "",
    vin: "",
    email: "",
    whatsapp: "",
    paymentMethod: "credit_card",
  });
  const [orderConfirmation, setOrderConfirmation] = useState<CarfaxOrder | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const selectedPackage = CARFAX_PACKAGES.find((pkg) => pkg.id === formData.packageId);

  const handlePackageSelect = (packageId: string) => {
    setFormData({ ...formData, packageId });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateStep = (): boolean => {
    if (currentStep === "select" && !formData.packageId) {
      toast.error("Please select a package");
      return false;
    }

    if (currentStep === "details") {
      if (!formData.vin.trim()) {
        toast.error("Please enter a valid VIN");
        return false;
      }
      if (formData.vin.length < 17) {
        toast.error("VIN must be at least 17 characters");
        return false;
      }
      if (!formData.email.trim()) {
        toast.error("Please enter your email address");
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        toast.error("Please enter a valid email address");
        return false;
      }
      if (!formData.whatsapp.trim()) {
        toast.error("Please enter your WhatsApp number");
        return false;
      }
      if (!/^\+?[\d\s\-()]{10,}$/.test(formData.whatsapp.replace(/\s/g, ""))) {
        toast.error("Please enter a valid phone number");
        return false;
      }
    }

    return true;
  };

  const handleNextStep = () => {
    if (validateStep()) {
      if (currentStep === "select") {
        setCurrentStep("details");
      } else if (currentStep === "details") {
        setCurrentStep("confirmation");
      }
    }
  };

  const handleSubmitOrder = async () => {
    setIsLoading(true);
    try {
      // Simulate API call - in production, this would send to your backend
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Create mock order confirmation
      const newOrder: CarfaxOrder = {
        id: `ORD-${Date.now()}`,
        orderNumber: `CFX-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        packageName: selectedPackage?.name || "Unknown",
        vin: formData.vin,
        email: formData.email,
        whatsapp: formData.whatsapp,
        amount: selectedPackage?.price || 0,
        paymentMethod:
          PAYMENT_METHODS.find((m) => m.id === formData.paymentMethod)?.label || "Unknown",
        status: "completed",
        createdAt: new Date().toISOString(),
        estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      setOrderConfirmation(newOrder);
      toast.success("Order placed successfully!");
    } catch (error) {
      toast.error("Failed to place order. Please try again.");
      console.error("Order error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartOver = () => {
    setCurrentStep("select");
    setFormData({
      packageId: "",
      vin: "",
      email: "",
      whatsapp: "",
      paymentMethod: "credit_card",
    });
    setOrderConfirmation(null);
  };

  // Step 1: Package Selection
  if (currentStep === "select" && !orderConfirmation) {
    return (
      <>
        <Navbar />
        <Header />
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12">
          <div className="container mx-auto px-4">
            {/* Header */}
            <div className="text-center mb-8 md:mb-12 px-2">
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-gray-900 mb-3 md:mb-4">
                Get Your Vehicle Report
              </h1>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
                Choose the perfect package to get detailed information about any vehicle
              </p>
            </div>

            {/* Step Indicator */}
            <div className="mb-8 md:mb-12 flex justify-center items-center gap-2 md:gap-8 px-2">
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-dealership-primary text-white flex items-center justify-center font-bold text-xs sm:text-base">
                  1
                </div>
                <span className="hidden sm:inline text-xs sm:text-sm font-semibold text-gray-700">Select Package</span>
              </div>
              <div className="w-6 h-0.5 sm:w-12 sm:h-1 bg-gray-300"></div>
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center font-bold text-xs sm:text-base">
                  2
                </div>
                <span className="hidden sm:inline text-xs sm:text-sm font-medium text-gray-500">Enter Details</span>
              </div>
              <div className="w-6 h-0.5 sm:w-12 sm:h-1 bg-gray-300"></div>
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center font-bold text-xs sm:text-base">
                  3
                </div>
                <span className="hidden sm:inline text-xs sm:text-sm font-medium text-gray-500">Confirmation</span>
              </div>
            </div>

            {/* Packages Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mb-8 md:mb-12 px-2">
              {CARFAX_PACKAGES.map((pkg) => (
                <Card
                  key={pkg.id}
                  className={`relative cursor-pointer transition-all hover:shadow-xl ${
                    formData.packageId === pkg.id
                      ? "ring-2 ring-dealership-primary shadow-lg"
                      : "hover:shadow-md"
                  } ${pkg.popular ? "md:scale-105" : ""}`}
                  onClick={() => handlePackageSelect(pkg.id)}
                >
                  {pkg.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-dealership-primary text-white px-4 py-1">
                        Best Value
                      </Badge>
                    </div>
                  )}
                  
                  {pkg.badge && !pkg.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-amber-500 text-white px-4 py-1">
                        {pkg.badge}
                      </Badge>
                    </div>
                  )}

                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                        <CardDescription>{pkg.description}</CardDescription>
                      </div>
                      {formData.packageId === pkg.id && (
                        <CheckCircle2 className="w-6 h-6 text-dealership-primary" />
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <div>
                      <div className="text-3xl font-bold text-gray-900">
                        ${pkg.price.toFixed(2)}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">(${pkg.pricePerReport.toFixed(2)}/Report)</p>
                    </div>

                    <div className="space-y-3">
                      {pkg.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      variant={formData.packageId === pkg.id ? "default" : "outline"}
                      className="w-full"
                      onClick={() => handlePackageSelect(pkg.id)}
                    >
                      {formData.packageId === pkg.id ? "Selected" : "Select Package"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Next Button */}
            <div className="flex justify-center px-2">
              <Button
                onClick={handleNextStep}
                size="lg"
                className="w-full sm:w-auto bg-dealership-primary hover:bg-dealership-primary/90 text-white px-6 sm:px-8"
              >
                Continue <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Step 2: Details Entry
  if (currentStep === "details" && !orderConfirmation) {
    return (
      <>
        <Navbar />
        <Header />
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8 md:py-12">
          <div className="container mx-auto px-3 sm:px-4 max-w-2xl">
            {/* Header */}
            <div className="text-center mb-8 md:mb-12">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-2">Enter Your Details</h1>
              <p className="text-sm sm:text-base text-gray-600">
                Provide your information to get the Cars history
              </p>
            </div>

            {/* Step Indicator */}
            <div className="mb-8 md:mb-12 flex justify-center items-center gap-2 md:gap-8 overflow-x-auto">
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3 flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-dealership-primary text-white flex items-center justify-center font-bold text-xs sm:text-base">
                  <Check className="w-4 h-4 sm:w-6 sm:h-6" />
                </div>
                <span className="hidden sm:inline text-xs sm:text-sm font-semibold text-gray-700">Select Package</span>
              </div>
              <div className="w-6 h-0.5 sm:w-12 sm:h-1 bg-dealership-primary flex-shrink-0"></div>
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3 flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-dealership-primary text-white flex items-center justify-center font-bold text-xs sm:text-base">
                  2
                </div>
                <span className="hidden sm:inline text-xs sm:text-sm font-semibold text-gray-700">Enter Details</span>
              </div>
              <div className="w-6 h-0.5 sm:w-12 sm:h-1 bg-gray-300 flex-shrink-0"></div>
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3 flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center font-bold text-xs sm:text-base">
                  3
                </div>
                <span className="hidden sm:inline text-xs sm:text-sm font-medium text-gray-500">Confirmation</span>
              </div>
            </div>

            {/* Selected Package Summary */}
            <Card className="mb-6 md:mb-8 bg-gradient-to-r from-dealership-primary/10 to-dealership-primary/5 border-dealership-primary/20">
              <CardContent className="pt-4 md:pt-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                      {selectedPackage?.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      {selectedPackage?.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl sm:text-3xl font-bold text-dealership-primary">
                      ${selectedPackage?.price.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Form */}
            <Card>
              <CardContent className="pt-6 md:pt-8 space-y-4 md:space-y-6">
                {/* VIN Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Vehicle VIN Number *
                  </label>
                  <Input
                    type="text"
                    name="vin"
                    value={formData.vin.toUpperCase()}
                    onChange={(e) =>
                      setFormData({ ...formData, vin: e.target.value.toUpperCase() })
                    }
                    placeholder="17-character VIN"
                    maxLength={17}
                    className="text-base md:text-lg font-mono tracking-wider"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    The VIN can be found on your vehicle's dashboard or registration
                  </p>
                </div>

                {/* Email Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    className="text-base md:text-lg"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    The report will be sent to this email address
                  </p>
                </div>

                {/* WhatsApp Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <MessageCircle className="w-4 h-4 inline mr-2" />
                    WhatsApp Number *
                  </label>
                  <Input
                    type="tel"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 000-0000"
                    className="text-base md:text-lg"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    We'll send a notification via WhatsApp when your report is ready
                  </p>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <DollarSign className="w-4 h-4 inline mr-2" />
                    Payment Method *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                    {PAYMENT_METHODS.map((method) => (
                      <button
                        key={method.id}
                        onClick={() =>
                          setFormData({
                            ...formData,
                            paymentMethod: method.id as any,
                          })
                        }
                        className={`p-3 md:p-4 rounded-lg border-2 transition-all text-center ${
                          formData.paymentMethod === method.id
                            ? "border-dealership-primary bg-dealership-primary/5"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="text-xl md:text-2xl mb-1 md:mb-2">{method.icon}</div>
                        <p className="text-xs md:text-sm font-semibold text-gray-900">{method.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Security Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4 flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs md:text-sm text-blue-900">
                    Your payment information is secure and encrypted. We never store full credit
                    card details.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 md:gap-3 pt-4 md:pt-6">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep("select")}
                    className="flex-1 text-sm md:text-base py-2 md:py-3"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleNextStep}
                    className="flex-1 bg-dealership-primary hover:bg-dealership-primary/90 text-sm md:text-base py-2 md:py-3"
                  >
                    Review Order <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Step 3: Confirmation
  if (currentStep === "confirmation" && !orderConfirmation) {
    return (
      <>
        <Navbar />
        <Header />
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8 md:py-12">
          <div className="container mx-auto px-3 sm:px-4 max-w-2xl">
            {/* Header */}
            <div className="text-center mb-8 md:mb-12">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Confirm Your Order</h1>
              <p className="text-sm sm:text-base text-gray-600">
                Review your details before completing your purchase
              </p>
            </div>

            {/* Step Indicator */}
            <div className="mb-8 md:mb-12 flex justify-center items-center gap-2 md:gap-8 overflow-x-auto">
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3 flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-dealership-primary text-white flex items-center justify-center font-bold text-xs sm:text-base">
                  <Check className="w-4 h-4 sm:w-6 sm:h-6" />
                </div>
                <span className="hidden sm:inline text-xs sm:text-sm font-semibold text-gray-700">Select Package</span>
              </div>
              <div className="w-6 h-0.5 sm:w-12 sm:h-1 bg-dealership-primary flex-shrink-0"></div>
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3 flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-dealership-primary text-white flex items-center justify-center font-bold text-xs sm:text-base">
                  <Check className="w-4 h-4 sm:w-6 sm:h-6" />
                </div>
                <span className="hidden sm:inline text-xs sm:text-sm font-semibold text-gray-700">Enter Details</span>
              </div>
              <div className="w-6 h-0.5 sm:w-12 sm:h-1 bg-dealership-primary flex-shrink-0"></div>
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3 flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-dealership-primary text-white flex items-center justify-center font-bold text-xs sm:text-base">
                  3
                </div>
                <span className="hidden sm:inline text-xs sm:text-sm font-semibold text-gray-700">Confirmation</span>
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-4 md:space-y-6 mb-6 md:mb-8">
              {/* Package Card */}
              <Card className="border-2 border-dealership-primary">
                <CardHeader className="pb-3 md:pb-4">
                  <CardTitle className="text-base md:text-lg">Package Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 md:space-y-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                    <div>
                      <p className="text-xs md:text-sm font-medium text-gray-600">Package</p>
                      <p className="text-base md:text-lg font-semibold text-gray-900">
                        {selectedPackage?.name}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-xs md:text-sm font-medium text-gray-600">Price</p>
                      <p className="text-2xl md:text-3xl font-bold text-dealership-primary">
                        ${selectedPackage?.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <hr className="my-3 md:my-4" />
                  <div>
                    <p className="text-xs md:text-sm font-medium text-gray-600 mb-2 md:mb-3">Includes:</p>
                    <ul className="space-y-1 md:space-y-2">
                      {selectedPackage?.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs md:text-sm text-gray-700">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Info Card */}
              <Card>
                <CardHeader className="pb-3 md:pb-4">
                  <CardTitle className="text-base md:text-lg">Your Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 md:space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <p className="text-xs md:text-sm font-medium text-gray-600">VIN Number</p>
                      <p className="text-sm md:text-base font-semibold text-gray-900 font-mono break-all">
                        {formData.vin}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm font-medium text-gray-600">Email</p>
                      <p className="text-sm md:text-base font-semibold text-gray-900 break-all">{formData.email}</p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm font-medium text-gray-600">WhatsApp Number</p>
                      <p className="text-sm md:text-base font-semibold text-gray-900">{formData.whatsapp}</p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm font-medium text-gray-600">Payment Method</p>
                      <p className="text-sm md:text-base font-semibold text-gray-900">
                        {PAYMENT_METHODS.find((m) => m.id === formData.paymentMethod)?.label}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pricing Card */}
              <Card className="bg-gradient-to-r from-gray-50 to-white">
                <CardContent className="pt-4 md:pt-6">
                  <div className="space-y-2 md:space-y-3">
                    <div className="flex justify-between text-xs md:text-base text-gray-700">
                      <span>Subtotal</span>
                      <span className="font-semibold">${selectedPackage?.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs md:text-base text-gray-700">
                      <span>Tax</span>
                      <span className="font-semibold">$0.00</span>
                    </div>
                    <hr />
                    <div className="flex justify-between text-base md:text-lg">
                      <span className="font-bold text-gray-900">Total</span>
                      <span className="font-bold text-dealership-primary text-xl md:text-2xl">
                        ${selectedPackage?.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Terms */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 md:p-4 flex items-start gap-2 md:gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs md:text-sm text-amber-900">
                  By completing this purchase, you agree to our Terms of Service. Your report
                  will be delivered within 24 hours via email and WhatsApp.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
              <Button
                variant="outline"
                onClick={() => setCurrentStep("details")}
                className="flex-1 text-sm md:text-base py-2 md:py-3"
              >
                Back
              </Button>
              <Button
                onClick={handleSubmitOrder}
                disabled={isLoading}
                className="flex-1 bg-dealership-primary hover:bg-dealership-primary/90 text-sm md:text-base py-2 md:py-3 md:py-6"
              >
                {isLoading ? "Processing..." : "Complete Purchase"}{" "}
                {!isLoading && <ChevronRight className="w-5 h-5 ml-2" />}
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Confirmation View
  if (orderConfirmation) {
    return (
      <>
        <Navbar />
        <Header />
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-8 md:py-12">
          <div className="container mx-auto px-3 sm:px-4 max-w-2xl">
            {/* Success Icon */}
            <div className="text-center mb-6 md:mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-green-100 mb-4 md:mb-6">
                <CheckCircle2 className="w-10 h-10 md:w-12 md:h-12 text-green-600" />
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 md:mb-3">Order Confirmed!</h1>
              <p className="text-sm sm:text-base md:text-lg text-gray-600">
                Thank you for your purchase. Your Car History report will be delivered soon.
              </p>
            </div>

            {/* Order Details */}
            <div className="space-y-4 md:space-y-6 mb-6 md:mb-8">
              <Card className="border-2 border-green-200 bg-green-50">
                <CardContent className="pt-4 md:pt-6">
                  <div className="space-y-3 md:space-y-4">
                    <div>
                      <p className="text-xs md:text-sm text-gray-600">Order Number</p>
                      <p className="text-xl md:text-2xl font-bold text-gray-900 font-mono break-all">
                        {orderConfirmation.orderNumber}
                      </p>
                    </div>
                    <hr className="border-green-200" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                      <div>
                        <p className="text-xs md:text-sm text-gray-600">Package</p>
                        <p className="text-base md:text-lg font-semibold text-gray-900">
                          {orderConfirmation.packageName}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs md:text-sm text-gray-600">Amount Paid</p>
                        <p className="text-base md:text-lg font-semibold text-gray-900">
                          ${orderConfirmation.amount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader className="pb-3 md:pb-4">
                  <CardTitle className="text-base md:text-lg">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 md:space-y-4">
                  <div className="flex items-start gap-2 md:gap-3">
                    <Mail className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs md:text-sm text-gray-600">Email</p>
                      <p className="text-sm md:text-base text-gray-900 font-semibold break-all">{orderConfirmation.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 md:gap-3">
                    <MessageCircle className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs md:text-sm text-gray-600">WhatsApp</p>
                      <p className="text-sm md:text-base text-gray-900 font-semibold">{orderConfirmation.whatsapp}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 md:gap-3">
                    <FileText className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs md:text-sm text-gray-600">Vehicle VIN</p>
                      <p className="text-sm md:text-base text-gray-900 font-semibold font-mono break-all">
                        {orderConfirmation.vin}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/")}
                className="flex-1 text-sm md:text-base py-2 md:py-3"
              >
                Back to Home
              </Button>
              <Button
                onClick={handleStartOver}
                className="flex-1 bg-dealership-primary hover:bg-dealership-primary/90 text-sm md:text-base py-2 md:py-3"
              >
                Get Another Report
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return null;
}
