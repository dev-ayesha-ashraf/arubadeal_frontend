import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Option {
  id: string;
  name: string;
}

interface Lookups {
  makes: Option[];
  fueltypes: Option[];
  transmissions: Option[];
  bodytypes: Option[];
  badges: Option[];
}

export interface EditVehicleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle: any;
  onSaved: () => void;
  lookups: Lookups;
  onSubmit?: (id: string, data: any) => Promise<void>;
}

export default function EditVehicleModal({
  open,
  onOpenChange,
  vehicle,
  onSaved,
  lookups,
  onSubmit,
}: EditVehicleModalProps) {
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (vehicle) {
      setForm({
        make_id: vehicle.make?.id || vehicle.make_id,
        model: vehicle.model?.name || vehicle.model, 
        year: vehicle.year,
        price: vehicle.price,
        mileage: vehicle.mileage,
        color: vehicle.color,
        location: vehicle.location,
        description: vehicle.description,
        seats: vehicle.seats,
        condition: vehicle.condition,
        fuel_type_id: vehicle.fuel_type?.id || vehicle.fuel_type_id,
        transmission_id: vehicle.transmission?.id || vehicle.transmission_id,
        body_type_id: vehicle.body_type?.id || vehicle.body_type_id,
        badge_id: vehicle.badge?.id || vehicle.badge_id,
        engine_type: vehicle.engine_type,
        min_price: vehicle.min_price,
      });
    }
  }, [vehicle]);

  function updateField(key: string, value: any) {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    if (!vehicle) return;

    setSaving(true);
    try {
      const payload = {
        make_id: form.make_id || null,
        model: form.model || null,
        year: form.year || null,
        price: form.price || null,
        mileage: form.mileage || null,
        color: form.color || null,
        location: form.location || null,
        description: form.description || null,
        seats: form.seats || null,
        condition: form.condition || null,
        fuel_type_id: form.fuel_type_id || null,
        transmission_id: form.transmission_id || null,
        body_type_id: form.body_type_id || null,
        badge_id: form.badge_id || null,
        engine_type: form.engine_type || null,
        min_price: form.min_price || null,
      };

      const cleanPayload = Object.fromEntries(
        Object.entries(payload).filter(([_, v]) => v !== null && v !== undefined && v !== "")
      );

      if (onSubmit) {
        await onSubmit(vehicle.id, cleanPayload);
      } else {
        // Default behavior (Seller)
        const token = localStorage.getItem("access_token");
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/seller_listing/update?id=${vehicle.id}`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(cleanPayload),
          }
        );

        if (!response.ok) {
          throw new Error('Failed to update vehicle');
        }
      }

      toast.success("Vehicle updated successfully");
      onSaved();
      onOpenChange(false);
    } catch (err: any) {
      console.error("Update failed:", err);
      toast.error("Failed to update vehicle");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[rgb(206,131,57)]">Edit Vehicle</DialogTitle>
          <DialogDescription>
            Update the details of this vehicle
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          {/* Make */}
          <div className="space-y-2">
            <Label htmlFor="edit-make">Make</Label>
            <Select value={form.make_id} onValueChange={(v) => updateField("make_id", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Make" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {lookups.makes.map((m: Option) => (
                  <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Model */}
          <div className="space-y-2">
            <Label htmlFor="edit-model">Model</Label>
            <Input
              id="edit-model"
              value={form.model || ""}
              onChange={(e) => updateField("model", e.target.value)}
            />
          </div>

          {/* Year */}
          <div className="space-y-2">
            <Label htmlFor="edit-year">Year</Label>
            <Input
              id="edit-year"
              type="number"
              value={form.year || ""}
              onChange={(e) => updateField("year", Number(e.target.value))}
              min="1900"
              max={new Date().getFullYear() + 1}
            />
          </div>

          {/* Fuel Type */}
          <div className="space-y-2">
            <Label htmlFor="edit-fuel-type">Fuel Type</Label>
            <Select value={form.fuel_type_id} onValueChange={(v) => updateField("fuel_type_id", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Fuel Type" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {lookups.fueltypes.map((f: Option) => (
                  <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Transmission */}
          <div className="space-y-2">
            <Label htmlFor="edit-transmission">Transmission</Label>
            <Select value={form.transmission_id} onValueChange={(v) => updateField("transmission_id", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Transmission" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {lookups.transmissions.map((t: Option) => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Engine Type */}
          <div className="space-y-2">
            <Label htmlFor="edit-engine-type">Engine Type</Label>
            <Input
              id="edit-engine-type"
              value={form.engine_type || ""}
              onChange={(e) => updateField("engine_type", e.target.value)}
              placeholder="e.g., V6, 4-Cylinder"
            />
          </div>

          {/* Body Type */}
          <div className="space-y-2">
            <Label htmlFor="edit-body-type">Body Type</Label>
            <Select
              value={form.body_type_id}
              onValueChange={(v) => updateField("body_type_id", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Body Type" />
              </SelectTrigger>
              <SelectContent className="bg-white max-h-48 overflow-y-auto">
                {lookups.bodytypes.map((b: Option) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Badge */}
          <div className="space-y-2">
            <Label htmlFor="edit-badge">Badge</Label>
            <Select value={form.badge_id} onValueChange={(v) => updateField("badge_id", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Badge" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {lookups.badges.map((b: Option) => (
                  <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label htmlFor="edit-color">Color</Label>
            <Input
              id="edit-color"
              value={form.color || ""}
              onChange={(e) => updateField("color", e.target.value)}
            />
          </div>

          {/* Mileage */}
          <div className="space-y-2">
            <Label htmlFor="edit-mileage">Mileage</Label>
            <Input
              id="edit-mileage"
              value={form.mileage || ""}
              onChange={(e) => updateField("mileage", e.target.value)}
            />
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="edit-price">Price</Label>
            <Input
              id="edit-price"
              type="number"
              value={form.price || ""}
              onChange={(e) => updateField("price", Number(e.target.value))}
            />
          </div>

          {/* Min Price */}
          <div className="space-y-2">
            <Label htmlFor="edit-min-price">Min Price</Label>
            <Input
              id="edit-min-price"
              type="number"
              value={form.min_price || ""}
              onChange={(e) => updateField("min_price", Number(e.target.value))}
            />
          </div>

          {/* Seats */}
          <div className="space-y-2">
            <Label htmlFor="edit-seats">Seats</Label>
            <Input
              id="edit-seats"
              type="number"
              value={form.seats || ""}
              onChange={(e) => updateField("seats", Number(e.target.value))}
            />
          </div>

          {/* Condition */}
          <div className="space-y-2">
            <Label htmlFor="edit-condition">Condition</Label>
            <Select value={form.condition} onValueChange={(v) => updateField("condition", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="used">Used</SelectItem>
                <SelectItem value="new">New</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="edit-location">Location</Label>
            <Input
              id="edit-location"
              value={form.location || ""}
              onChange={(e) => updateField("location", e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="col-span-2 space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={form.description || ""}
              onChange={(e) => updateField("description", e.target.value)}
              rows={4}
            />
          </div>

        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[rgb(206,131,57)] hover:bg-[rgb(206,131,57)]/90"
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}