import React from 'react';
import { Button } from "@/components/ui/button";
import { Trash2, Settings } from "lucide-react";

interface CustomProperty {
  _id: string;
  name: string;
  type: 'text' | 'number' | 'select';
  options?: string[];
  required: boolean;
  value?: string;
}

interface PropertySectionProps {
  properties: CustomProperty[];
  onAddProperty: () => void;
  onRemoveProperty: (id: string) => void;
  onPropertyValueChange?: (propertyId: string, value: string) => void;
  onEditOptions?: (propertyId: string) => void;
}

export function PropertySection({ 
  properties, 
  onAddProperty, 
  onRemoveProperty,
  onPropertyValueChange,
  onEditOptions
}: PropertySectionProps) {
  // Handle change of property value
  const handleValueChange = (propertyId: string, value: string) => {
    if (onPropertyValueChange) {
      onPropertyValueChange(propertyId, value);
    }
  };

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">Custom Properties</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAddProperty}
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
                  <div className="flex space-x-1">
                    {property.type === 'select' && onEditOptions && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditOptions(property._id)}
                        className="text-blue-500 h-6 px-2"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveProperty(property._id)}
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
                    value={property.value || ''}
                    onChange={(e) => handleValueChange(property._id, e.target.value)}
                  />
                )}
                {property.type === 'number' && (
                  <input
                    type="number"
                    name={`custom_${property._id}`}
                    className="w-full p-2 border rounded-md"
                    required={property.required}
                    value={property.value || ''}
                    onChange={(e) => handleValueChange(property._id, e.target.value)}
                  />
                )}
                {property.type === 'select' && (
                  <select
                    name={`custom_${property._id}`}
                    className="w-full p-2 border rounded-md"
                    required={property.required}
                    value={property.value || ''}
                    onChange={(e) => handleValueChange(property._id, e.target.value)}
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
    </div>
  );
} 