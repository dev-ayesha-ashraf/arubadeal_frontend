import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { User, PenSquare, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { motion } from "framer-motion";

const fetchMe = async () => {
  const response = await fetch(`${import.meta.env.VITE_API_URL1}/me`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
  });
  if (!response.ok) throw new Error("Failed to fetch profile");
  return response.json();
};

const Profile = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", phoneNo: "", address: "", city: "" });
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    fetchMe()
      .then((data) => {
        setFormData({
          name: `${data.first_name} ${data.mid_name ?? ""} ${data.last_name}`.trim(),
          email: data.email,
          phoneNo: data.contact_detail?.phone_no1 ?? "",
          address: data.address?.street ?? "",
          city: data.address?.city ?? "",
        });
      })
      .catch(() => toast({ title: "Error", description: "Failed to load profile", variant: "destructive" }))
      .finally(() => setLoadingProfile(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleLogout = () => {
    logout();
    navigate("/");
    toast({ title: "Logged out", description: "You have been logged out successfully." });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <Header />

      <motion.div className="flex-1 flex justify-center px-4 py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <motion.div className="w-full max-w-4xl bg-white shadow-lg rounded-2xl p-8 space-y-8" initial={{ y: 20 }} animate={{ y: 0 }} transition={{ type: "spring", stiffness: 90 }}>
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
            <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-gray-100 shadow-md group">
              {imagePreview ? (
                <img src={imagePreview} className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-gray-100 text-gray-400">
                  <User className="w-10 h-10" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <PenSquare className="w-6 h-6 text-white" />
                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageChange} />
              </div>
            </div>

            <div className="text-center md:text-left space-y-2">
              <h2 className="text-2xl font-semibold text-gray-800">{formData.name}</h2>
              <p className="text-gray-500 text-sm">{formData.email}</p>
              <div className="flex gap-3 justify-center md:justify-start">
                <Button variant="outline" className="hover:bg-gray-100" onClick={() => (user?.role === "admin" ? navigate("/admin") : navigate("/"))}>
                  {user?.role === "admin" ? "Admin Panel" : "Home"}
                </Button>
                <Button variant="destructive" className="flex items-center gap-2" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" /> Logout
                </Button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loadingProfile ? (
              <p className="text-gray-500 italic col-span-2">Loading profile...</p>
            ) : (
              ["name", "email", "phoneNo", "city"].map((field) => (
                <div key={field} className="space-y-1">
                  <label className="block text-sm font-medium text-gray-500 capitalize">{field}</label>
                  <p className="text-gray-800 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 shadow-sm">
                    {(formData as any)[field] || "—"}
                  </p>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </motion.div>

      <Footer />
    </div>
  );
};

export default Profile;