import { Navbar } from '@/components/common/Navbar';
import { Header } from '@/components/common/Header';
import React, { useState } from 'react';
import { Footer } from "@/components/common/Footer";

const CarfaxReportOrder = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPackage, setSelectedPackage] = useState('4109990');
  const [paymentMethod, setPaymentMethod] = useState('VISA');
  const [email, setEmail] = useState('');
  const [zip, setZip] = useState('');
  const [agreement, setAgreement] = useState(false);
  const [specialOffers, setSpecialOffers] = useState(true);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');

  const packages = [
    {
      id: '20756',
      name: '1 Car history Report',
      price: '$44.99',
      pricePerReport: '$44.99/Report',
      description: 'Best for one car only.',
      icon: './car-history1.png',
      badge: 'POPULAR',
      badgeColor: 'bg-dealership-gold'
    },
    {
      id: '22779',
      name: '2 Car history Reports',
      price: '$59.99',
      pricePerReport: '$30.00/Report',
      description: 'Best for comparing two cars.',
      icon: './car-history2.png',
      badge: 'SAVE $30',
      badgeColor: 'bg-green-500'
    },
    {
      id: '4109990',
      name: '4 Car history Reports',
      price: '$109.99',
      pricePerReport: '$27.50/Report',
      description: 'Best for comparing multiple cars.',
      icon: './car-history3.png',
      badge: 'SAVE $70',
      badgeColor: 'bg-green-500'
    }
  ];

  const paymentMethods = [
    {
      id: 'VISA',
      name: 'Visa',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png'
    },
    {
      id: 'MASTERCARD',
      name: 'Mastercard',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png'
    },
    {
      id: 'PAYPAL',
      name: 'PayPal',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/2560px-PayPal.svg.png'
    },
  ];

  const handleContinueToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && zip && agreement) {
      setCurrentStep(2);
    } else {
      alert('Please fill all required fields and agree to the terms');
    }
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (cardNumber && expiryDate && cvv && cardholderName) {
      console.log({
        selectedPackage,
        paymentMethod,
        email,
        zip,
        cardNumber,
        expiryDate,
        cvv,
        cardholderName,
        agreement,
        specialOffers
      });
      alert('Payment submitted successfully!');
      setCurrentStep(1);
      setEmail('');
      setZip('');
      setCardNumber('');
      setExpiryDate('');
      setCvv('');
      setCardholderName('');
    } else {
      alert('Please fill all payment details');
    }
  };

  return (
    <div className="min-h-screen font-inter bg-background text-foreground">
      <Header />
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        {currentStep === 1 ? (
          <>
            {/* Header Section */}
            <div className="mb-12">
              <h1 className="text-center text-4xl font-bold text-black mb-2">
                Order Car History Reports
              </h1>
              <p className="text-center text-gray-600">Get detailed vehicle history with car history Reports</p>
            </div>

            {/* Step 1: Package Selection */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-black mb-6">
                Step 1. Select Your Package
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {packages.map((pkg) => (
                  <label
                    key={pkg.id}
                    className={`relative cursor-pointer border-2 rounded-lg p-6 transition-all duration-200 ${
                      selectedPackage === pkg.id
                        ? 'border-dealership-gold bg-dealership-gold/5'
                        : 'border-gray-200 hover:border-dealership-gold/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="package-option"
                      value={pkg.id}
                      checked={selectedPackage === pkg.id}
                      onChange={(e) => setSelectedPackage(e.target.value)}
                      className="sr-only"
                      aria-label={pkg.name}
                    />

                    {pkg.badge && (
                      <div
                        className={`absolute -top-3 left-4 ${pkg.badgeColor} text-white px-3 py-1 rounded-full text-xs font-bold`}
                      >
                        {pkg.badge}
                      </div>
                    )}

                    <div className="flex flex-col items-center text-center h-full">
                      {pkg.id === '20756' && (
                        <i className="bi bi-1-circle-fill text-5xl text-dealership-gold mb-4"></i>
                      )}
                      {pkg.id === '22779' && (
                        <i className="bi bi-2-circle-fill text-5xl text-dealership-gold mb-4"></i>
                      )}
                      {pkg.id === '4109990' && (
                        <i className="bi bi-4-circle-fill text-5xl text-dealership-gold mb-4"></i>
                      )}

                      <div className="flex-grow w-full">
                        <div className="font-bold text-black mb-3 text-lg">
                          {pkg.name}
                        </div>
                        <div className="mb-3">
                          <span className="text-3xl font-bold text-dealership-gold">
                            {pkg.price}
                          </span>
                          <div className="text-gray-600 text-sm mt-1">
                            {pkg.pricePerReport}
                          </div>
                        </div>
                        <div className="text-gray-600 text-sm">
                          {pkg.description}
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </section>

            {/* Step 2: Payment Method */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-black mb-6">
                Step 2. Select Payment Method
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      paymentMethod === method.id
                        ? 'border-dealership-gold bg-dealership-gold/5'
                        : 'border-gray-200 hover:border-dealership-gold/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment-select"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="sr-only"
                      aria-label={method.name}
                    />
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        paymentMethod === method.id
                          ? 'border-dealership-gold'
                          : 'border-gray-300'
                      }`}
                    >
                      {paymentMethod === method.id && (
                        <div className="w-2.5 h-2.5 rounded-full bg-dealership-gold"></div>
                      )}
                    </div>
                    <img
                      src={method.icon}
                      alt={method.name}
                      className="h-6 object-contain"
                    />
                  </label>
                ))}
              </div>
            </section>

            {/* Step 3: Personal Details */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-black mb-6">
                Step 3. Personal Details
              </h2>

              <form onSubmit={handleContinueToPayment} className="space-y-6 max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-bold text-black mb-2"
                    >
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@email.com"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dealership-gold focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="zip"
                      className="block text-sm font-bold text-black mb-2"
                    >
                      ZIP <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="zip"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      placeholder="Enter ZIP code"
                      maxLength={7}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dealership-gold focus:border-transparent"
                    />
                  </div>
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    id="order-form-agreement"
                    checked={agreement}
                    onChange={(e) => setAgreement(e.target.checked)}
                    required
                    className="sr-only"
                  />
                  <div
                    className={`flex-shrink-0 w-5 h-5 border-2 rounded flex items-center justify-center mt-1 ${
                      agreement
                        ? 'bg-dealership-gold border-dealership-gold'
                        : 'border-gray-300'
                    }`}
                  >
                    {agreement && (
                      <svg
                        className="w-3.5 h-3.5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="3"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="text-gray-700 text-sm">
                    I agree to the{' '}
                    <button
                      type="button"
                      className="text-dealership-gold hover:underline font-bold"
                    >
                      Customer Agreement
                    </button>{' '}
                    and understand that Car History may not have the complete history of every vehicle.
                  </span>
                </label>

                <button
                  type="submit"
                  className="w-full md:w-auto px-8 py-3 bg-dealership-gold text-white font-bold rounded-lg hover:bg-dealership-gold/90 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-dealership-gold focus:ring-offset-2"
                >
                  Continue to Payment for {packages.find(p => p.id === selectedPackage)?.name}
                </button>
              </form>
            </section>

            {/* Special Offers Checkbox */}
            <label className="flex items-start gap-3 cursor-pointer max-w-2xl">
              <input
                type="checkbox"
                id="special-offers-input"
                checked={specialOffers}
                onChange={(e) => setSpecialOffers(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`flex-shrink-0 w-5 h-5 border-2 rounded flex items-center justify-center mt-1 ${
                  specialOffers
                    ? 'bg-dealership-gold border-dealership-gold'
                    : 'border-gray-300'
                }`}
              >
                {specialOffers && (
                  <svg
                    className="w-3.5 h-3.5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
            </label>
          </>
        ) : (
          <>
            {/* Step 4: Payment Details */}
            <div className="mb-12">
              <button
                onClick={() => setCurrentStep(1)}
                className="text-dealership-gold font-bold hover:underline mb-6"
              >
                ← Back
              </button>
              <h1 className="text-4xl font-bold text-dealership-navy mb-2">
                Step 4. Payment Details
              </h1>
              <p className="text-gray-600">Complete your order for {packages.find(p => p.id === selectedPackage)?.name}</p>
            </div>

            <div className="max-w-2xl">
              {/* Order Summary */}
              <div className="bg-gray-50 p-6 rounded-lg mb-8 border border-gray-200">
                <h3 className="text-lg font-bold text-black mb-4">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Package:</span>
                    <span className="font-bold text-black">{packages.find(p => p.id === selectedPackage)?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Email:</span>
                    <span className="font-bold text-black">{email}</span>
                  </div>
                  <div className="border-t border-gray-300 mt-4 pt-4 flex justify-between">
                    <span className="font-bold text-black">Total:</span>
                    <span className="text-2xl font-bold text-dealership-gold">{packages.find(p => p.id === selectedPackage)?.price}</span>
                  </div>
                </div>
              </div>

              {/* Payment Form */}
              <form onSubmit={handleSubmitPayment} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-black mb-2">
                    Cardholder Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    placeholder="Full Name"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dealership-gold focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-black mb-2">
                    Card Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 '))}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dealership-gold focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-black mb-2">
                      Expiry Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value.replace(/\D/g, '').replace(/(.{2})/g, '$1/'))}
                      placeholder="MM/YY"
                      maxLength={5}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dealership-gold focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black mb-2">
                      CVV <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                      placeholder="123"
                      maxLength={4}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dealership-gold focus:border-transparent"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full px-8 py-3 bg-dealership-gold text-white font-bold rounded-lg hover:bg-dealership-gold/90 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-dealership-gold focus:ring-offset-2"
                >
                  Complete Payment for {packages.find(p => p.id === selectedPackage)?.price}
                </button>
              </form>

              {/* Security Info */}
              <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-bold text-dealership-navy">🔒 Secure Payment</span>: Your payment information is encrypted and secure.
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default CarfaxReportOrder;