import React, { useState } from 'react';
import { FormField, Button } from '@/components/ui';
import { Warehouse } from '@/lib/supabase';

interface WarehouseFormProps {
  warehouse?: Warehouse;
  onSubmit: (data: Omit<Warehouse, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const WarehouseForm: React.FC<WarehouseFormProps> = ({
  warehouse,
  onSubmit,
  onCancel,
  isSubmitting
}) => {
  const [formData, setFormData] = useState<Omit<Warehouse, 'id' | 'created_at' | 'updated_at'>>({
    name: warehouse?.name || '',
    location: warehouse?.location || ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Warehouse name is required';
    if (!formData.location.trim()) newErrors.location = 'Warehouse location is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      await onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField
        label="Warehouse Name"
        name="name"
        type="text"
        value={formData.name}
        onChange={handleChange}
        required
        error={errors.name}
        placeholder="Enter warehouse name"
      />
      
      <FormField
        label="Location"
        name="location"
        type="text"
        value={formData.location}
        onChange={handleChange}
        required
        error={errors.location}
        placeholder="Enter warehouse address or location identifier"
        helperText="This can be a physical address, city, or internal location code"
      />
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button
          variant="outline"
          onClick={onCancel}
          type="button"
        >
          Cancel
        </Button>
        
        <Button
          variant="primary"
          type="submit"
          isLoading={isSubmitting}
          disabled={isSubmitting}
        >
          {warehouse ? 'Update Warehouse' : 'Add Warehouse'}
        </Button>
      </div>
    </form>
  );
};

export default WarehouseForm; 