import React, { useState } from 'react';
import { FormField, Button } from '@/components/ui';
import { Inventory } from '@/lib/supabase';

interface InventoryAdjustmentFormProps {
  item: Inventory;
  onSubmit: (adjustmentData: {
    quantity: number;
    adjustmentReason: string;
    notes: string;
    type: 'add' | 'subtract';
  }) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const ADJUSTMENT_REASONS = [
  { value: 'counting', label: 'Inventory Counting' },
  { value: 'damage', label: 'Damaged Items' },
  { value: 'loss', label: 'Lost Items' },
  { value: 'return', label: 'Customer Return' },
  { value: 'receiving', label: 'Item Receiving' },
  { value: 'correction', label: 'System Correction' },
  { value: 'other', label: 'Other' }
];

const InventoryAdjustmentForm: React.FC<InventoryAdjustmentFormProps> = ({
  item,
  onSubmit,
  onCancel,
  isSubmitting
}) => {
  const [formData, setFormData] = useState({
    quantity: 1,
    adjustmentReason: ADJUSTMENT_REASONS[0].value,
    notes: '',
    type: 'add' as 'add' | 'subtract'
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      if (name === 'quantity') {
        const quantity = parseInt(value);
        return { ...prev, [name]: isNaN(quantity) ? 0 : Math.max(1, quantity) };
      }
      return { ...prev, [name]: value };
    });
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle adjustment type change
  const handleTypeChange = (type: 'add' | 'subtract') => {
    setFormData(prev => ({ ...prev, type }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (formData.quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }
    
    if (!formData.adjustmentReason) {
      newErrors.adjustmentReason = 'Adjustment reason is required';
    }
    
    if (formData.type === 'subtract' && formData.quantity > item.quantity) {
      newErrors.quantity = `Cannot subtract more than the current quantity (${item.quantity})`;
    }
    
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
      <div className="bg-gray-50 p-4 rounded-md mb-4">
        <div className="flex justify-between">
          <span className="font-medium">Current Quantity:</span>
          <span className="font-bold">{item.quantity}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Item:</span>
          <span>{item.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">SKU:</span>
          <span>{item.sku}</span>
        </div>
      </div>

      <div className="flex space-x-3 mb-4">
        <button
          type="button"
          className={`flex-1 py-2 rounded-md font-medium ${
            formData.type === 'add'
              ? 'bg-green-100 text-green-800 border border-green-300'
              : 'bg-gray-100 text-gray-800 border border-gray-200'
          }`}
          onClick={() => handleTypeChange('add')}
        >
          Add Stock
        </button>
        <button
          type="button"
          className={`flex-1 py-2 rounded-md font-medium ${
            formData.type === 'subtract'
              ? 'bg-red-100 text-red-800 border border-red-300'
              : 'bg-gray-100 text-gray-800 border border-gray-200'
          }`}
          onClick={() => handleTypeChange('subtract')}
        >
          Remove Stock
        </button>
      </div>

      <FormField
        label="Quantity to Adjust"
        name="quantity"
        type="number"
        value={formData.quantity.toString()}
        onChange={handleChange}
        required
        error={errors.quantity}
        min={1}
      />
      
      <FormField
        label="Adjustment Reason"
        name="adjustmentReason"
        type="select"
        value={formData.adjustmentReason}
        onChange={handleChange}
        required
        error={errors.adjustmentReason}
        options={ADJUSTMENT_REASONS}
      />
      
      {formData.adjustmentReason === 'other' && (
        <FormField
          label="Specify Reason"
          name="otherReason"
          type="text"
          value={formData.notes}
          onChange={handleChange}
          required
          error={errors.notes}
          placeholder="Specify the reason for adjustment"
        />
      )}
      
      <FormField
        label="Notes"
        name="notes"
        type="textarea"
        value={formData.notes}
        onChange={handleChange}
        rows={3}
        placeholder="Add any additional notes about this adjustment"
      />
      
      <div className="border-t pt-4 mt-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium">
              {formData.type === 'add' ? 'New Quantity:' : 'New Quantity:'}{' '}
              <span className="text-lg font-bold">
                {formData.type === 'add'
                  ? item.quantity + formData.quantity
                  : Math.max(0, item.quantity - formData.quantity)}
              </span>
            </p>
          </div>
          
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onCancel}
              type="button"
            >
              Cancel
            </Button>
            
            <Button
              variant={formData.type === 'add' ? 'success' : 'danger'}
              type="submit"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              {formData.type === 'add' ? 'Add Stock' : 'Remove Stock'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default InventoryAdjustmentForm; 