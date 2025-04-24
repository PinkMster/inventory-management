import React, { useState, useEffect } from 'react'
import { FormField, Button } from '@/components/ui'
import { supabase } from '@/lib/supabase/client'

interface MovementFormProps {
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
  isSubmitting: boolean
}

const MovementForm: React.FC<MovementFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting
}) => {
  const [formData, setFormData] = useState({
    inventory_id: '',
    from_location: '',
    to_location: '',
    quantity: 1,
    notes: ''
  })

  const [inventoryItems, setInventoryItems] = useState<any[]>([])
  const [warehouseSections, setWarehouseSections] = useState<any[]>([])
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [availableQuantity, setAvailableQuantity] = useState(0)
  
  // Load inventory items and warehouse sections
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load inventory items
        const { data: inventory, error: inventoryError } = await supabase
          .from('inventory')
          .select('*')
          .order('name')
        
        if (inventoryError) throw inventoryError
        
        // Load warehouse sections
        const { data: sections, error: sectionsError } = await supabase
          .from('warehouse_sections')
          .select('*, warehouses(name)')
          .order('name')
        
        if (sectionsError) throw sectionsError
        
        setInventoryItems(inventory || [])
        setWarehouseSections(sections || [])
      } catch (error) {
        console.error('Error loading data:', error)
      }
    }
    
    loadData()
  }, [])
  
  // Update available quantity when inventory item changes
  useEffect(() => {
    if (formData.inventory_id) {
      const item = inventoryItems.find(item => item.id === formData.inventory_id)
      if (item) {
        setSelectedItem(item)
        setAvailableQuantity(item.quantity)
        
        // Pre-select the current location of the item
        setFormData(prev => ({
          ...prev,
          from_location: item.location
        }))
      }
    }
  }, [formData.inventory_id, inventoryItems])
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    setFormData(prev => {
      // Handle numeric quantity field
      if (name === 'quantity') {
        return { ...prev, [name]: parseInt(value) || 0 }
      }
      return { ...prev, [name]: value }
    })
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.inventory_id) newErrors.inventory_id = 'Please select an item'
    if (!formData.from_location) newErrors.from_location = 'Please select source location'
    if (!formData.to_location) newErrors.to_location = 'Please select destination location'
    if (formData.from_location === formData.to_location) {
      newErrors.to_location = 'Source and destination cannot be the same'
    }
    if (formData.quantity <= 0) newErrors.quantity = 'Quantity must be greater than 0'
    if (formData.quantity > availableQuantity) {
      newErrors.quantity = `Cannot move more than available (${availableQuantity})`
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      await onSubmit({
        ...formData,
        user_id: 'current_user_id' // This would be replaced with actual user ID
      })
    }
  }
  
  // Get warehouse name for a section
  const getWarehouseName = (sectionId: string) => {
    const section = warehouseSections.find(s => s.id === sectionId)
    return section ? `${section.warehouses.name} / ${section.name}` : ''
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {/* Inventory Item Selection */}
        <FormField
          label="Inventory Item"
          name="inventory_id"
          type="select"
          value={formData.inventory_id}
          onChange={handleChange}
          required
          error={errors.inventory_id}
        >
          <option value="">Select an item</option>
          {inventoryItems.map(item => (
            <option key={item.id} value={item.id}>
              {item.name} (SKU: {item.sku}) - Current Qty: {item.quantity}
            </option>
          ))}
        </FormField>
        
        {/* Display item details if selected */}
        {selectedItem && (
          <div className="bg-blue-50 p-3 rounded-md mb-2">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Selected Item:</span> {selectedItem.name} ({selectedItem.sku})
            </p>
            <p className="text-sm text-blue-800">
              <span className="font-medium">Current Location:</span> {getWarehouseName(selectedItem.location)}
            </p>
            <p className="text-sm text-blue-800">
              <span className="font-medium">Available Quantity:</span> {availableQuantity}
            </p>
          </div>
        )}
        
        {/* Source Location */}
        <FormField
          label="From Location"
          name="from_location"
          type="select"
          value={formData.from_location}
          onChange={handleChange}
          required
          error={errors.from_location}
          disabled={!!selectedItem} // Disable if item is selected (use current location)
        >
          <option value="">Select source location</option>
          {warehouseSections.map(section => (
            <option key={section.id} value={section.id}>
              {section.warehouses.name} / {section.name}
            </option>
          ))}
        </FormField>
        
        {/* Destination Location */}
        <FormField
          label="To Location"
          name="to_location"
          type="select"
          value={formData.to_location}
          onChange={handleChange}
          required
          error={errors.to_location}
        >
          <option value="">Select destination location</option>
          {warehouseSections.map(section => (
            <option 
              key={section.id} 
              value={section.id}
              disabled={section.id === formData.from_location} // Prevent selecting same location
            >
              {section.warehouses.name} / {section.name}
            </option>
          ))}
        </FormField>
        
        {/* Quantity */}
        <FormField
          label="Quantity to Move"
          name="quantity"
          type="number"
          min="1"
          max={availableQuantity.toString()}
          value={formData.quantity.toString()}
          onChange={handleChange}
          required
          error={errors.quantity}
        />
        
        {/* Notes */}
        <FormField
          label="Notes (Optional)"
          name="notes"
          type="textarea"
          value={formData.notes}
          onChange={handleChange}
          error={errors.notes}
        />
      </div>
      
      <div className="flex justify-end space-x-3 mt-6">
        <Button
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
          type="button"
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          type="submit"
          disabled={isSubmitting}
          isLoading={isSubmitting}
        >
          {isSubmitting ? 'Processing...' : 'Move Inventory'}
        </Button>
      </div>
    </form>
  )
}

export default MovementForm 