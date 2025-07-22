import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { User, PenSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

// API function for updating profile
const updateProfile = async (formData: FormData): Promise<any> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/users/update-profile`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${JSON.parse(
          localStorage.getItem("access_token") || ""
        )}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to update profile: ${response.status}`);
  }
  const res = await response.json();
  return res.data;
};

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const roleDisplay = user?.role === 1 ? "Admin" : "Dealer";
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phoneNo: user?.phoneNo || '',
    address: user?.address || '',
    city: user?.city || '',
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      // Update local storage user object
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      const updatedUser = {
        ...currentUser,
        ...data,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // Invalidate queries and show success toast
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      // Create preview URL for the selected image
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  // Clean up preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleSubmit = () => {
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('phoneNo', formData.phoneNo);
    formDataToSend.append('address', formData.address);
    formDataToSend.append('city', formData.city);
    
    if (selectedImage) {
      formDataToSend.append('profileImage', selectedImage);
    }

    updateProfileMutation.mutate(formDataToSend);
  };

  return (
    <div className="flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Profile</h1>
        <div className="flex items-center gap-4 mb-6">
          <div className="relative w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center group">
            {imagePreview || user?.image ? (
              <>
                <img
                  src={imagePreview || (user?.image ? `${import.meta.env.VITE_MEDIA_URL}/${user.image}` : null)}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <PenSquare className="w-6 h-6 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleImageChange}
                  />
                </div>
              </>
            ) : (
              <>
                <User className="w-10 h-10 text-gray-500" />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <PenSquare className="w-6 h-6 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleImageChange}
                  />
                </div>
              </>
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{formData.name}</h2>
            <p className="text-gray-500">{formData.email}</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              name="name"
              className="w-full p-2 border rounded-md"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              className="w-full p-2 border rounded-md"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone Number</label>
            <input
              type="tel"
              name="phoneNo"
              className="w-full p-2 border rounded-md"
              value={formData.phoneNo}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <input
              type="text"
              name="address"
              className="w-full p-2 border rounded-md"
              value={formData.address}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">City</label>
            <input
              type="text"
              name="city"
              className="w-full p-2 border rounded-md"
              value={formData.city}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <input
              type="text"
              className="w-full p-2 border rounded-md bg-gray-50"
              value={roleDisplay}
              readOnly
            />
          </div>
          <Button 
            className="w-full" 
            onClick={handleSubmit}
            disabled={updateProfileMutation.isPending}
          >
            {updateProfileMutation.isPending ? "Updating..." : "Update Profile"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
