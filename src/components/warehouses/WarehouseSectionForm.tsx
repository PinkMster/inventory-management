import React, { useState } from 'react';
import { FormField, Button } from '@/components/ui';
import { WarehouseSection } from '@/lib/supabase';

interface WarehouseSectionFormProps {
  section?: WarehouseSection;
  warehouseId: string;
  onSubmit: (data: Omit<WarehouseSection, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const WarehouseSectionForm: React.FC<WarehouseSectionFormProps> = ({
  section,
  warehouseId,
  onSubmit,
  onCancel,
  isSubmitting
}) => {
  const [formData, setFormData] = useState<Omit<WarehouseSection, 'id' | 'created_at' | 'updated_at'>>({
    warehouse_id: warehouseId,
    name: section?.name || '',
    capacity: section?.capacity || 0
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      // Handle numeric fields
      if (name === 'capacity') {
        return { ...prev, [name]: parseInt(value) || 0 };
      }
      return { ...prev, [name]: value };
    });
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Section name is required';
    if (formData.capacity < 0) newErrors.capacity = 'Capacity cannot be negative';
    
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
        label="Section Name"
        name="name"
        type="text"
        value={formData.name}
        onChange={handleChange}
        required
        error={errors.name}
        placeholder="Enter section name (e.g., 'Section A', 'Aisle 5')"
      />
      
      <FormField
        label="Capacity"
        name="capacity"
        type="number"
        value={formData.capacity.toString()}
        onChange={handleChange}
        error={errors.capacity}
        helperText="The storage capacity of this section (number of items, volume, etc.)"
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
          {section ? 'Update Section' : 'Add Section'}
        </Button>
      </div>
    </form>
  );
};

export default WarehouseSectionForm; 