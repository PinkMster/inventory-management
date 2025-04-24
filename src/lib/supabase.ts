import { Database } from './database.types'

// Type definitions for Supabase tables

// Inventory types
export type Inventory = Database['public']['Tables']['inventory']['Row']
export type InventoryInsert = Database['public']['Tables']['inventory']['Insert']
export type InventoryUpdate = Database['public']['Tables']['inventory']['Update']

// Warehouse types
export type Warehouse = Database['public']['Tables']['warehouses']['Row'] & {
  sections_count?: number;
  capacity?: string | number;
};
export type WarehouseInsert = Database['public']['Tables']['warehouses']['Insert']
export type WarehouseUpdate = Database['public']['Tables']['warehouses']['Update']

// Warehouse section types
export type WarehouseSection = Database['public']['Tables']['warehouse_sections']['Row']
export type WarehouseSectionInsert = Database['public']['Tables']['warehouse_sections']['Insert']
export type WarehouseSectionUpdate = Database['public']['Tables']['warehouse_sections']['Update']

// Inventory movement types
export type InventoryMovement = Database['public']['Tables']['inventory_movements']['Row']
export type InventoryMovementInsert = Database['public']['Tables']['inventory_movements']['Insert']
export type InventoryMovementUpdate = Database['public']['Tables']['inventory_movements']['Update']

// Inventory adjustment types
export type InventoryAdjustment = Database['public']['Tables']['inventory_adjustments']['Row']
export type InventoryAdjustmentInsert = Database['public']['Tables']['inventory_adjustments']['Insert']
export type InventoryAdjustmentUpdate = Database['public']['Tables']['inventory_adjustments']['Update']