import React, { useState, useEffect } from 'react';
import { FormField, Button } from '@/components/ui';
import { supabase } from '@/lib/supabase/client';
import { Inventory } from '@/lib/supabase';

interface InventoryFormProps {
  item?: Inventory;
  onSubmit: (data: Omit<Inventory, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  dictionary: any;
}

const InventoryForm: React.FC<InventoryFormProps> = ({
  item,
  onSubmit,
  onCancel,
  isSubmitting,
  dictionary
}) => {
  const [formData, setFormData] = useState<Omit<Inventory, 'id' | 'created_at' | 'updated_at'>>({
    sku: item?.sku || '',
    name: item?.name || '',
    description: item?.description || '',
    category: item?.category || '',
    quantity: item?.quantity || 0,
    min_stock: item?.min_stock || 0,
    reorder_quantity: item?.reorder_quantity || 0,
    location: item?.location || ''
  });
  
  const [warehouses, setWarehouses] = useState<{id: string, name: string}[]>([]);
  const [warehouseSections, setWarehouseSections] = useState<{id: string, name: string, warehouse_id: string}[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categoriesList, setCategoriesList] = useState<string[]>([]);

  // Load the item data if editing
  useEffect(() => {
    if (item) {
      setFormData({
        sku: item.sku,
        name: item.name,
        description: item.description,
        category: item.category,
        quantity: item.quantity,
        min_stock: item.min_stock,
        reorder_quantity: item.reorder_quantity,
        location: item.location
      });
      
      // If editing an item, set the selected warehouse based on the location
      const loadLocationWarehouse = async () => {
        try {
          const { data, error } = await supabase
            .from('warehouse_sections')
            .select('warehouse_id')
            .eq('id', item.location)
            .single();
            
          if (data) {
            setSelectedWarehouse(data.warehouse_id);
          }
        } catch (error) {
          console.error('Error loading warehouse for location:', error);
        }
      };
      
      loadLocationWarehouse();
    }
  }, [item]);

  // Load warehouses and categories
  useEffect(() => {
    const loadWarehouses = async () => {
      try {
        const { data, error } = await supabase
          .from('warehouses')
          .select('id, name')
          .order('name');
          
        if (error) throw error;
        setWarehouses(data || []);
      } catch (error) {
        console.error('Error loading warehouses:', error);
      }
    };
    
    const loadCategories = async () => {
      try {
        // Get distinct categories from the inventory table
        const { data, error } = await supabase
          .from('inventory')
          .select('category')
          .order('category');
          
        if (error) throw error;
        
        // Extract unique categories using an array filter instead of Set
        const uniqueCategories: string[] = [];
        data.forEach(item => {
          if (item.category && !uniqueCategories.includes(item.category)) {
            uniqueCategories.push(item.category);
          }
        });
        setCategoriesList(uniqueCategories);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    
    loadWarehouses();
    loadCategories();
  }, []);

  // Load warehouse sections when warehouse is selected
  useEffect(() => {
    if (selectedWarehouse) {
      const loadWarehouseSections = async () => {
        try {
          const { data, error } = await supabase
            .from('warehouse_sections')
            .select('id, name, warehouse_id')
            .eq('warehouse_id', selectedWarehouse)
            .order('name');
            
          if (error) throw error;
          setWarehouseSections(data || []);
        } catch (error) {
          console.error('Error loading warehouse sections:', error);
        }
      };
      
      loadWarehouseSections();
    } else {
      setWarehouseSections([]);
    }
  }, [selectedWarehouse]);

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      // Handle numeric fields
      if (['quantity', 'min_stock', 'reorder_quantity'].includes(name)) {
        return { ...prev, [name]: parseInt(value) || 0 };
      }
      return { ...prev, [name]: value };
    });
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle warehouse selection
  const handleWarehouseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedWarehouse(e.target.value);
    // Clear location when warehouse changes
    setFormData(prev => ({ ...prev, location: '' }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.sku.trim()) newErrors.sku = 'SKU is required';
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.category.trim()) newErrors.category = 'Category is required';
    if (formData.quantity < 0) newErrors.quantity = 'Quantity cannot be negative';
    if (formData.min_stock < 0) newErrors.min_stock = 'Min stock cannot be negative';
    if (formData.reorder_quantity < 0) newErrors.reorder_quantity = 'Reorder quantity cannot be negative';
    if (!formData.location) newErrors.location = 'Location is required';
    
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label={dictionary.inventory.table.name}
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          required
          error={errors.name}
        />
        
        <FormField
          label={dictionary.inventory.table.sku}
          name="sku"
          type="text"
          value={formData.sku}
          onChange={handleChange}
          required
          error={errors.sku}
        />
      </div>
      
      <FormField
        label="Description"
        name="description"
        type="textarea"
        value={formData.description || ''}
        onChange={handleChange}
        rows={3}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Category"
          name="category"
          type="select"
          value={formData.category}
          onChange={handleChange}
          required
          error={errors.category}
          options={[
            ...categoriesList.map(cat => ({ value: cat, label: cat })),
            { value: 'new-category', label: '+ Add New Category' }
          ]}
        />
        
        {formData.category === 'new-category' && (
          <FormField
            label="New Category Name"
            name="category"
            type="text"
            value=""
            onChange={handleChange}
            required
            error={errors.category}
          />
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          label={dictionary.inventory.table.quantity}
          name="quantity"
          type="number"
          value={formData.quantity.toString()}
          onChange={handleChange}
          required
          error={errors.quantity}
        />
        
        <FormField
          label="Min Stock Level"
          name="min_stock"
          type="number"
          value={formData.min_stock.toString()}
          onChange={handleChange}
          required
          error={errors.min_stock}
          helperText="Alert when stock falls below this level"
        />
        
        <FormField
          label="Reorder Quantity"
          name="reorder_quantity"
          type="number"
          value={formData.reorder_quantity.toString()}
          onChange={handleChange}
          required
          error={errors.reorder_quantity}
          helperText="Amount to order when restocking"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Warehouse"
          name="warehouse"
          type="select"
          value={selectedWarehouse}
          onChange={handleWarehouseChange}
          required
          error={errors.warehouse}
          options={warehouses.map(wh => ({ value: wh.id, label: wh.name }))}
        />
        
        <FormField
          label={dictionary.inventory.table.location}
          name="location"
          type="select"
          value={formData.location}
          onChange={handleChange}
          required
          disabled={!selectedWarehouse}
          error={errors.location}
          options={warehouseSections.map(section => ({ 
            value: section.id, 
            label: section.name 
          }))}
        />
      </div>
      
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
          {isSubmitting ? dictionary.common.loading : dictionary.common.save}
        </Button>
      </div>
    </form>
  );
};

export default InventoryForm; 