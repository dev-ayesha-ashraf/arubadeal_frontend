import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface CustomProperty {
  _id: string;
  name: string;
  type: 'text' | 'number' | 'select';
  options?: string[]; // For select type
  required: boolean;
  value?: string; // For storing current value
}

interface PropertyManagerProps {
  properties: CustomProperty[];
  onChange: (properties: CustomProperty[]) => void;
  className?: string;
}

export const PropertyManager = ({ properties, onChange, className = "" }: PropertyManagerProps) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showOptionsDialog, setShowOptionsDialog] = useState<CustomProperty | null>(null);
  const [newProperty, setNewProperty] = useState<Partial<CustomProperty>>({
    name: '',
    type: 'text',
    required: false
  });
  const { toast } = useToast();

  const handleAddProperty = () => {
    if (!newProperty.name) {
      toast({
        title: "Error",
        description: "Property name is required",
        variant: "destructive",
      });
      return;
    }

    // Check if property with same name already exists
    if (properties.some(p => p.name.toLowerCase() === newProperty.name.toLowerCase())) {
      toast({
        title: "Error",
        description: "A property with this name already exists",
        variant: "destructive",
      });
      return;
    }

    const property: CustomProperty = {
      _id: Date.now().toString(), // Unique ID based on timestamp
      name: newProperty.name,
      type: newProperty.type || 'text',
      options: newProperty.type === 'select' ? ['Option 1', 'Option 2'] : undefined,
      required: newProperty.required || false
    };

    onChange([...properties, property]);
    setShowAddDialog(false);
    setNewProperty({
      name: '',
      type: 'text',
      required: false
    });
    
    toast({
      title: "Success",
      description: "Custom property added successfully",
    });
  };

  const handleRemoveProperty = (propertyId: string) => {
    if (confirm("Are you sure you want to delete this property? This will remove it from all future vehicles.")) {
      onChange(properties.filter(p => p._id !== propertyId));
      toast({
        title: "Success",
        description: "Property removed successfully",
      });
    }
  };

  const handleEditPropertyOptions = (propertyId: string, options: string[]) => {
    onChange(properties.map(p => {
      if (p._id === propertyId) {
        return { ...p, options };
      }
      return p;
    }));
  };

  const PropertyOptionsDialog = ({ property, onClose, onSave }) => {
    const [options, setOptions] = useState(property.options || []);
    const [newOption, setNewOption] = useState("");

    const addOption = () => {
      if (newOption.trim()) {
        setOptions([...options, newOption.trim()]);
        setNewOption("");
      }
    };

    const removeOption = (index: number) => {
      setOptions(options.filter((_, i) => i !== index));
    };

    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent aria-describedby="options-dialog-description">
          <DialogHeader>
            <DialogTitle>Edit Options for {property.name}</DialogTitle>
            <DialogDescription id="options-dialog-description">
              Add, edit, or remove dropdown options for this property.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...options];
                      newOptions[index] = e.target.value;
                      setOptions(newOptions);
                    }}
                    className="flex-1 p-2 border rounded-md"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOption(index)}
                    className="text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                placeholder="Add new option"
                className="flex-1 p-2 border rounded-md"
              />
              <Button onClick={addOption}>Add</Button>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={() => {
                onSave(property._id, options);
                onClose();
              }}>
                Save Options
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">Custom Properties</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowAddDialog(true)}
        >
          Add Property
        </Button>
      </div>
      
      {properties.length === 0 ? (
        <div className="text-center py-4 text-gray-500 border border-dashed rounded-md">
          No custom properties defined. Click "Add Property" to create one.
        </div>
      ) : (
        <div className="space-y-4 border p-4 rounded-md">
          {properties.map((property) => (
            <div key={property._id} className="flex gap-2 items-start border-b pb-3">
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium">
                    {property.name} {property.required && <span className="text-red-500">*</span>}
                  </label>
                  <div className="flex gap-1">
                    {property.type === 'select' && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowOptionsDialog(property)}
                        className="text-blue-500 h-6 px-2"
                      >
                        Edit Options
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveProperty(property._id)}
                      className="text-red-500 h-6 px-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mb-1">Type: {property.type}</div>
                {property.type === 'text' && (
                  <input
                    type="text"
                    name={`custom_${property._id}`}
                    className="w-full p-2 border rounded-md"
                    required={property.required}
                  />
                )}
                {property.type === 'number' && (
                  <input
                    type="number"
                    name={`custom_${property._id}`}
                    className="w-full p-2 border rounded-md"
                    required={property.required}
                  />
                )}
                {property.type === 'select' && (
                  <select
                    name={`custom_${property._id}`}
                    className="w-full p-2 border rounded-md"
                    required={property.required}
                  >
                    <option value="">Select an option</option>
                    {(property.options || []).map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Property Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent aria-describedby="property-dialog-description">
          <DialogHeader>
            <DialogTitle>Add New Property</DialogTitle>
            <DialogDescription id="property-dialog-description">
              Add a new custom property for vehicles. Properties are saved permanently.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Property Name</label>
              <input
                type="text"
                value={newProperty.name}
                onChange={(e) => setNewProperty({ ...newProperty, name: e.target.value })}
                className="w-full p-2 border rounded-md"
                placeholder="Enter property name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Property Type</label>
              <select
                value={newProperty.type}
                onChange={(e) => setNewProperty({ ...newProperty, type: e.target.value as 'text' | 'number' | 'select' })}
                className="w-full p-2 border rounded-md"
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="select">Dropdown Select</option>
              </select>
            </div>
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={newProperty.required}
                  onChange={(e) => setNewProperty({ ...newProperty, required: e.target.checked })}
                />
                <span>Required</span>
              </label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddProperty}>Add Property</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Options Dialog */}
      {showOptionsDialog && (
        <PropertyOptionsDialog
          property={showOptionsDialog}
          onClose={() => setShowOptionsDialog(null)}
          onSave={handleEditPropertyOptions}
        />
      )}
    </div>
  );
}; 