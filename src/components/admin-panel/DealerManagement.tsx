import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Car, MapPin, Globe } from "lucide-react";
import { useState } from "react";

const DealerManagement = () => {
  const [dealers, setDealers] = useState([
    {
      id: 1,
      name: "Premium Motors",
      email: "contact@premiummotors.com",
      phone: "+297 569 4343",
      address: "123 Dealer Street",
      city: "Los Angeles",
      state: "CA",
      zip: "90001",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100",
      totalCars: 128,
      rating: 4.8,
      yearsActive: 15,
    },
  ]);
  const [showAddEditDialog, setShowAddEditDialog] = useState(false);
  const [editingDealer, setEditingDealer] = useState<any | null>(null);
  const { toast } = useToast();

  const handleAddEdit = (dealer: any) => {
    if (dealer.id) {
      setDealers(dealers.map((d) => (d.id === dealer.id ? dealer : d)));
      toast({
        title: "Success",
        description: "Dealer updated successfully",
      });
    } else {
      setDealers([...dealers, { ...dealer, id: dealers.length + 1 }]);
      toast({
        title: "Success",
        description: "Dealer added successfully",
      });
    }
    setShowAddEditDialog(false);
    setEditingDealer(null);
  };

  const handleDelete = (id: number) => {
    setDealers(dealers.filter((dealer) => dealer.id !== id));
    toast({
      title: "Success",
      description: "Dealer deleted successfully",
    });
  };

  // Function to open the main website in a new tab
  const openMainWebsite = () => {
    // Open the main website in a new tab without setting any session flags
    window.open("/", "_blank");
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dealer Management</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={openMainWebsite}
          >
            <Globe className="w-4 h-4" />
            View Website
          </Button>
          <Button
            onClick={() => {
              setEditingDealer({
                name: "",
                email: "",
                phone: "",
                address: "",
                city: "",
                state: "",
                zip: "",
                image: "",
                totalCars: 0,
                rating: 0,
                yearsActive: 0,
              });
              setShowAddEditDialog(true);
            }}
          >
            Add New Dealer
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dealers.map((dealer) => (
          <div key={dealer.id} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-4 mb-4">
              <img
                src={dealer.image}
                alt={dealer.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h3 className="text-xl font-semibold text-dealership-navy">
                  {dealer.name}
                </h3>
                <div className="flex items-center text-gray-600 mt-1">
                  <MapPin size={16} className="mr-1" />
                  <span className="text-sm">
                    {dealer.city}, {dealer.state}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center text-gray-600">
              <Car size={16} className="mr-1" />
              <span className="text-sm">{dealer.totalCars} Cars Listed</span>
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span>Rating</span>
                <span className="font-semibold">{dealer.rating}/5.0 ⭐</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span>Years Active</span>
                <span className="font-semibold">
                  {dealer.yearsActive}+ Years
                </span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingDealer(dealer);
                  setShowAddEditDialog(true);
                }}
              >
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(dealer.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={showAddEditDialog} onOpenChange={setShowAddEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingDealer?.id ? "Edit Dealer" : "Add New Dealer"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleAddEdit({
                id: editingDealer?.id,
                name: formData.get("name"),
                email: formData.get("email"),
                phone: formData.get("phone"),
                address: formData.get("address"),
                city: formData.get("city"),
                state: formData.get("state"),
                zip: formData.get("zip"),
                image: formData.get("image"),
                totalCars: Number(formData.get("totalCars")),
                rating: Number(formData.get("rating")),
                yearsActive: Number(formData.get("yearsActive")),
              });
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  name="name"
                  defaultValue={editingDealer?.name}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  name="email"
                  type="email"
                  defaultValue={editingDealer?.email}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  name="phone"
                  defaultValue={editingDealer?.phone}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Image URL
                </label>
                <input
                  name="image"
                  defaultValue={editingDealer?.image}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Address
                </label>
                <input
                  name="address"
                  defaultValue={editingDealer?.address}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <input
                  name="city"
                  defaultValue={editingDealer?.city}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">State</label>
                <input
                  name="state"
                  defaultValue={editingDealer?.state}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  ZIP Code
                </label>
                <input
                  name="zip"
                  defaultValue={editingDealer?.zip}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Total Cars
                </label>
                <input
                  name="totalCars"
                  type="number"
                  defaultValue={editingDealer?.totalCars}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Rating</label>
                <input
                  name="rating"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  defaultValue={editingDealer?.rating}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Years Active
                </label>
                <input
                  name="yearsActive"
                  type="number"
                  defaultValue={editingDealer?.yearsActive}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button type="submit">
                {editingDealer?.id ? "Save" : "Add"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddEditDialog(false);
                  setEditingDealer(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DealerManagement;
