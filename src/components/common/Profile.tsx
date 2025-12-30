import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { User, PenSquare, LogOut, LayoutDashboard } from "lucide-react";
import { useState, useEffect } from "react";
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
  if (response.status === 401) throw new Error("unauthorized");
  if (!response.ok) throw new Error("Failed to fetch profile");
  return response.json();
};

const uploadProfileImage = async (file: File) => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`${import.meta.env.VITE_API_URL1}/profile-image`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload image");
  }

  return response.json();
};

const Profile = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNo: "",
    address: "",
    city: "",
  });

  const [userData, setUserData] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchMe()
      .then((data) => {
        setUserData(data);
        setFormData({
          name: `${data.first_name} ${data.mid_name ?? ""} ${data.last_name}`.trim(),
          email: data.email,
          phoneNo: data.contact_detail?.phone_no1 ?? "",
          address: data.address?.street ?? "",
          city: data.address?.city ?? "",
        });
      })
      .catch((err) => {
        if (err.message === "unauthorized") {
          logout();
          toast({
            title: "Session expired",
            description: "Please log in again.",
            variant: "destructive",
          });
          navigate("/");
        } else {
          toast({
            title: "Error",
            description: "Failed to load profile.",
            variant: "destructive",
          });
        }
      })
      .finally(() => setLoadingProfile(false));
  }, []);

  const getProfileImageUrl = () => {
    if (!userData?.image_url) return null;
    return `${import.meta.env.VITE_MEDIA_URL}${userData.image_url}`;
  };

  const getUserInitials = () => {
    if (!userData) return "U";
    const { first_name, last_name } = userData;
    let initials = "";
    if (first_name) initials += first_name.charAt(0).toUpperCase();
    if (last_name) initials += last_name.charAt(0).toUpperCase();
    return initials || "U";
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
    setImageError(false);
  };

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleUploadImage = async () => {
    if (!selectedImage) {
      toast({
        title: "No Image Selected",
        description: "Please choose an image before uploading.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const result = await uploadProfileImage(selectedImage);

      toast({
        title: "Image Updated",
        description: "Your profile image was updated successfully.",
      });

      setUserData((prev: any) => ({
        ...prev,
        image_url: result.image_url,
      }));

      setSelectedImage(null);
      setImagePreview(null);

    } catch (err: any) {
      toast({
        title: "Upload Failed",
        description: err.message || "Could not upload image.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
  };

  const profileImageUrl = getProfileImageUrl();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <Navbar />
      <motion.div
        className="flex-1 flex justify-center px-6 py-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="w-full max-w-4xl space-y-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <motion.div
              className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-dealership-primary/70 shadow-[0_0_20px_rgba(99,102,241,0.2)] group"
              whileHover={{ scale: 1.05 }}
            >
              {imagePreview ? (
                <img src={imagePreview} className="w-full h-full object-cover" />
              ) : profileImageUrl && !imageError ? (
                <img
                  src={profileImageUrl}
                  onError={() => setImageError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-dealership-primary/10 text-dealership-primary">
                  <span className="text-2xl font-bold">{getUserInitials()}</span>
                </div>
              )}

              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <PenSquare className="w-6 h-6 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleImageChange}
                />
              </div>
            </motion.div>

            {selectedImage && (
              <Button
                onClick={handleUploadImage}
                disabled={uploading}
                className="bg-dealership-primary text-white hover:bg-dealership-primary/90"
              >
                {uploading ? "Uploading..." : "Update Profile Image"}
              </Button>
            )}

            <div className="text-center md:text-left space-y-2">
              <h2 className="text-3xl font-bold text-gray-800 tracking-tight">
                {formData.name || "Loading..."}
              </h2>
              <p className="text-gray-600">{formData.email}</p>

              <div className="flex flex-wrap gap-3 justify-center md:justify-start mt-4">
                {user?.role === "admin" && (
                  <Button
                    variant="outline"
                    className="border-dealership-primary text-dealership-primary hover:bg-dealership-primary hover:text-white"
                    onClick={() => navigate("/admin")}
                  >
                    Admin Panel
                  </Button>
                )}
                {user?.role === "seller" && (
                  <Button
                    variant="outline"
                    className="border-dealership-primary text-dealership-primary hover:bg-dealership-primary hover:text-white flex items-center gap-2"
                    onClick={() => navigate("/seller")}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Seller Dashboard
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="border-dealership-primary text-dealership-primary hover:bg-dealership-primary hover:text-white"
                  onClick={() => navigate("/")}
                >
                  Home
                </Button>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 text-red-600 hover:bg-red-50"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" /> Logout
                </Button>
              </div>
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {loadingProfile ? (
              <p className="text-gray-500 italic col-span-2">Loading profile...</p>
            ) : (
              ["name", "email", "phoneNo", "city", "role"].map((field) => (
                <motion.div
                  key={field}
                  whileHover={{ scale: 1.02 }}
                  className="p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 bg-white"
                >
                  <label className="block text-sm font-medium text-gray-500 capitalize mb-1">
                    {field}
                  </label>
                  <p className="text-lg font-semibold text-gray-800">
                    {field === "role" ? user?.role ?? "—" : (formData as any)[field] || "—"}
                  </p>
                </motion.div>
              ))
            )}
          </motion.div>
        </div>
      </motion.div>

      <Footer />
    </div>
  );
};

export default Profile;
