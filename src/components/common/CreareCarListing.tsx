import React, { useState, useEffect } from "react";
import axios from "axios";
import { Header } from "./Header";
import { Navbar } from "./Navbar";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
interface ContactDetail {
  phone_no1: string;
  phone_no2?: string;
  whatsapp_no?: string;
}

interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  landmark?: string;
}

interface User {
  first_name: string;
  mid_name?: string;
  last_name: string;
  user_name: string;
  email: string;
  birth_date?: string;
  contact_detail: ContactDetail;
  address: Address;
}

interface Car {
  make_id: string;
  model: string;
  year: string;
  fuel_type_id: string;
  transmission_id: string;
  engine_type?: string;
  body_type_id: string;
  badge_id?: string;
  location: string;
  seats?: string;
  condition: string;
  color: string;
  mileage: string;
  price: string;
  min_price?: string;
  description: string;
  features: string[];
}

const CreateCarListing = () => {
  const [user, setUser] = useState<User>({
    first_name: "",
    mid_name: "",
    last_name: "",
    user_name: "",
    email: "",
    birth_date: "",
    contact_detail: { phone_no1: "", phone_no2: "", whatsapp_no: "" },
    address: { street: "", city: "", state: "", country: "", postal_code: "", landmark: "" },
  });

  const [car, setCar] = useState<Car>({
    make_id: "",
    model: "",
    year: "",
    fuel_type_id: "",
    transmission_id: "",
    engine_type: "",
    body_type_id: "",
    badge_id: "",
    location: "",
    seats: "",
    condition: "",
    color: "",
    mileage: "",
    price: "",
    min_price: "",
    description: "",
    features: [],
  });

  const [images, setImages] = useState<File[]>([]);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [activeSection, setActiveSection] = useState<"user" | "car" | "images">("user");
  const [lookups, setLookups] = useState({
    makes: [] as { id: string; name: string }[],
    bodytypes: [] as { id: string; name: string }[],
    fueltypes: [] as { id: string; name: string }[],
    transmissions: [] as { id: string; name: string }[],
    badges: [] as { id: string; name: string }[],
  });

  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const [makes, bodytypes, fueltypes, transmissions, badges] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/make/get_all`),
          axios.get(`${import.meta.env.VITE_API_URL}/bodytype/get_all`),
          axios.get(`${import.meta.env.VITE_API_URL}/fueltype/get_all`),
          axios.get(`${import.meta.env.VITE_API_URL}/transmission/get_all`),
          axios.get(`${import.meta.env.VITE_API_URL}/badge/get_all`),
        ]);

        setLookups({
          makes: makes.data,
          bodytypes: bodytypes.data,
          fueltypes: fueltypes.data,
          transmissions: transmissions.data,
          badges: badges.data,
        });
      } catch (err) {
        console.error("Error fetching lookup data", err);
      }
    };

    fetchLookups();
  }, []);


  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("contact_detail.")) {
      const key = name.split(".")[1] as keyof ContactDetail;
      setUser((prev) => ({
        ...prev,
        contact_detail: { ...prev.contact_detail, [key]: value },
      }));
    } else if (name.startsWith("address.")) {
      const key = name.split(".")[1] as keyof Address;
      setUser((prev) => ({
        ...prev,
        address: { ...prev.address, [key]: value },
      }));
    } else {
      setUser((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCarChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCar((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setErrors([]);

    try {
      const formData = new FormData();

      Object.entries(car).forEach(([key, value]) => {
        if (key === "features") {
          (value as string[]).forEach((f) => formData.append("features[]", f));
        } else {
          formData.append(key, value);
        }
      });

      formData.append("user_info", JSON.stringify(user));
      images.forEach((img) => formData.append("images", img));

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/seller_listing/create`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.status === 200) {
        setMessage("Car listing submitted successfully!");
      } else {
        setMessage("Unexpected response from server.");
      }
    } catch (err: any) {
      if (err.response?.status === 422) {
        const backendErrors = err.response.data.detail?.map((e: any) => e.msg) || [];
        setErrors(backendErrors);
      } else {
        setMessage("Something went wrong! Please try again.");
      }
    }
  };


  return (
    <div className="min-h-screen">
      <Header />
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="text-center mb-8">
          <h1 className="mt-[120px] lg:mt-5 text-3xl font-bold text-black mb-3">
            Create Car Listing
          </h1>
          <p className="text-dealership-primary">
            Sell your car quickly and easily
          </p>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-lg text-center text-sm font-medium ${message.includes("successfully")
            ? "bg-green-100 text-green-800 border border-green-200"
            : "bg-red-100 text-red-800 border border-red-200"
            }`}>
            {message}
          </div>
        )}

        {errors.length > 0 && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 text-sm">
            <h4 className="text-red-800 font-semibold mb-2">Please fix the following errors:</h4>
            <ul className="list-disc list-inside space-y-1">
              {errors.map((err, idx) => (
                <li key={idx} className="text-red-700">
                  {err}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-center gap-2 mb-6 flex-wrap">
          {["user", "car", "images"].map((section, idx) => (
            <button
              key={section}
              onClick={() => setActiveSection(section as any)}
              className={`px-2 py-1 rounded-full border text-xs font-medium transition-all 
        ${activeSection === section
                  ? "bg-white text-dealership-primary border-dealership-primary/50"
                  : "bg-white/10 text-black border-white/20 hover:bg-white/20"
                } 
        md:px-4 md:py-2 md:text-sm md:font-medium`}
            >
              <span className="mr-1 md:mr-2 inline-flex items-center justify-center w-4 h-4 md:w-6 md:h-6 rounded-full bg-dealership-primary text-white text-[10px] md:text-xs">
                {idx + 1}
              </span>
              {section === "user" ? "Seller Info" : section === "car" ? "Car Details" : "Photos"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} encType="multipart/form-data" className="bg-white rounded-xl  p-6 backdrop-blur-sm">
          <div className={`space-y-6 ${activeSection === "user" ? "block" : "hidden"}`}>
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-1">Seller Information</h2>
              <p className="text-gray-600 text-sm">Tell us about yourself</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                  First Name *
                </label>
                <input
                  name="first_name"
                  placeholder="John"
                  onChange={handleUserChange}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                  Middle Name
                </label>
                <input
                  name="mid_name"
                  placeholder="Michael"
                  onChange={handleUserChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                  Last Name *
                </label>
                <input
                  name="last_name"
                  placeholder="Doe"
                  onChange={handleUserChange}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                  Username *
                </label>
                <input
                  name="user_name"
                  placeholder="johndoe"
                  onChange={handleUserChange}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                  Email *
                </label>
                <input
                  name="email"
                  placeholder="john@example.com"
                  type="email"
                  onChange={handleUserChange}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                  Birth Date
                </label>
                <input
                  name="birth_date"
                  type="date"
                  onChange={handleUserChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Contact Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                    Primary Phone *
                  </label>
                  <input
                    name="contact_detail.phone_no1"
                    placeholder="+1 (555) 000-0000"
                    onChange={handleUserChange}
                    required
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                    Secondary Phone
                  </label>
                  <input
                    name="contact_detail.phone_no2"
                    placeholder="+1 (555) 000-0000"
                    onChange={handleUserChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                    WhatsApp Number
                  </label>
                  <input
                    name="contact_detail.whatsapp_no"
                    placeholder="+1 (555) 000-0000"
                    onChange={handleUserChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                    Street Address
                  </label>
                  <input
                    name="address.street"
                    placeholder="123 Main Street"
                    onChange={handleUserChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                    City
                  </label>
                  <input
                    name="address.city"
                    placeholder="New York"
                    onChange={handleUserChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                    State
                  </label>
                  <input
                    name="address.state"
                    placeholder="NY"
                    onChange={handleUserChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                    Country
                  </label>
                  <input
                    name="address.country"
                    placeholder="United States"
                    onChange={handleUserChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                    Postal Code
                  </label>
                  <input
                    name="address.postal_code"
                    placeholder="10001"
                    onChange={handleUserChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                    Landmark
                  </label>
                  <input
                    name="address.landmark"
                    placeholder="Near Central Park"
                    onChange={handleUserChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={`space-y-6 ${activeSection === "car" ? "block" : "hidden"}`}>
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-1">Car Details</h2>
              <p className="text-gray-600 text-sm">Describe your vehicle</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="make_id">Make *</Label>
                <Select value={car.make_id} onValueChange={(v) => setCar(prev => ({ ...prev, make_id: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Make" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {lookups.makes.map((m) => (
                      <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>


              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                  Model *
                </label>
                <input
                  name="model"
                  placeholder="Camry"
                  onChange={handleCarChange}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                  Year *
                </label>
                <input
                  name="year"
                  placeholder="2020"
                  type="number"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  onChange={handleCarChange}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                />
              </div>

              <div>
                <Label htmlFor="fuel_type_id">Fuel Type *</Label>
                <Select value={car.fuel_type_id} onValueChange={(v) => setCar(prev => ({ ...prev, fuel_type_id: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Fuel Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {lookups.fueltypes.map((f) => (
                      <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="transmission_id">Transmission *</Label>
                <Select value={car.transmission_id} onValueChange={(v) => setCar(prev => ({ ...prev, transmission_id: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Transmission" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {lookups.transmissions.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>


              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                  Engine Type
                </label>
                <input
                  name="engine_type"
                  placeholder="2.5L 4-cylinder"
                  onChange={handleCarChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                />
              </div>

              <div>
                <Label htmlFor="body_type_id">Body Type *</Label>
                <Select value={car.body_type_id} onValueChange={(v) => setCar(prev => ({ ...prev, body_type_id: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Body Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {lookups.bodytypes.map((b) => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="badge_id">Badge</Label>
                <Select value={car.badge_id || ""} onValueChange={(v) => setCar(prev => ({ ...prev, badge_id: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Badge" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {lookups.badges.map((b) => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>


              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                  Location *
                </label>
                <input
                  name="location"
                  placeholder="New York, NY"
                  onChange={handleCarChange}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                  Seats
                </label>
                <input
                  name="seats"
                  placeholder="5"
                  type="number"
                  min="1"
                  max="20"
                  onChange={handleCarChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                  Condition *
                </label>
                <select
                  name="condition"
                  onChange={handleCarChange}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                >
                  <option value="">Select Condition</option>
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                  Color *
                </label>
                <input
                  name="color"
                  placeholder="Red"
                  onChange={handleCarChange}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                  Mileage *
                </label>
                <input
                  name="mileage"
                  placeholder="50000"
                  type="number"
                  onChange={handleCarChange}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                  Price ($) *
                </label>
                <input
                  name="price"
                  placeholder="25000"
                  type="number"
                  step="0.01"
                  onChange={handleCarChange}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                  Minimum Price ($)
                </label>
                <input
                  name="min_price"
                  placeholder="23000"
                  type="number"
                  step="0.01"
                  onChange={handleCarChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                Description *
              </label>
              <textarea
                name="description"
                placeholder="Describe your car's features, condition, maintenance history, and any special details..."
                rows={4}
                onChange={handleCarChange}
                required
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white resize-vertical"
              ></textarea>
            </div>
          </div>
          <div className={`space-y-6 ${activeSection === "images" ? "block" : "hidden"}`}>
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-1">Car Photos</h2>
              <p className="text-gray-600 text-sm">Upload clear photos of your vehicle</p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <input
                  type="file"
                  multiple
                  onChange={handleImageChange}
                  accept="image/*"
                  id="car-images"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <label
                  htmlFor="car-images"
                  className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-dealership-primary rounded-xl bg-dealership-primary/20 cursor-pointer transition-all duration-200 hover:bg-blue-100 hover:border-blue-500"
                >
                  <div className="text-2xl mb-2">📷</div>
                  <h3 className="text-base font-semibold text-gray-800 mb-1">Click to upload photos</h3>
                  <p className="text-gray-600 text-sm mb-1">Select multiple images of your car</p>
                  <span className="text-xs text-gray-500">PNG, JPG, JPEG up to 10MB each</span>
                </label>
              </div>
              {images.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-base font-semibold text-gray-800 mb-3">
                    Selected Images ({images.length})
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {Array.from(images).map((image, index) => (
                      <div key={index} className="rounded-lg overflow-hidden shadow-sm border">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-20 object-cover"
                        />
                        <div className="p-1 bg-white">
                          <span className="text-xs text-gray-600 truncate block">
                            {image.name}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            {activeSection !== "user" && (
              <button
                type="button"
                className="px-6 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-all duration-200 text-sm"
                onClick={() => setActiveSection(activeSection === "car" ? "user" : "car")}
              >
                Previous
              </button>
            )}

            {activeSection !== "images" ? (
              <button
                type="button"
                className="ml-auto px-6 py-2 bg-dealership-primary text-white rounded-lg font-medium hover:bg-dealership-primary/70 transition-all duration-200 text-sm"
                onClick={() => setActiveSection(activeSection === "user" ? "car" : "images")}
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="ml-auto px-6 py-2 bg-dealership-primary text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-200 text-sm"
              >
                Submit Listing
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCarListing;