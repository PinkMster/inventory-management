export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      warehouses: {
        Row: {
          id: string
          name: string
          location: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          location: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          location?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      warehouse_sections: {
        Row: {
          id: string
          warehouse_id: string
          name: string
          capacity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          warehouse_id: string
          name: string
          capacity: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          warehouse_id?: string
          name?: string
          capacity?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "warehouse_sections_warehouse_id_fkey"
            columns: ["warehouse_id"]
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          }
        ]
      }
      inventory: {
        Row: {
          id: string
          sku: string
          name: string
          description: string | null
          category: string
          quantity: number
          min_stock: number
          reorder_quantity: number
          location: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sku: string
          name: string
          description?: string | null
          category: string
          quantity: number
          min_stock: number
          reorder_quantity: number
          location: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sku?: string
          name?: string
          description?: string | null
          category?: string
          quantity?: number
          min_stock?: number
          reorder_quantity?: number
          location?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_location_fkey"
            columns: ["location"]
            referencedRelation: "warehouse_sections"
            referencedColumns: ["id"]
          }
        ]
      }
      inventory_movements: {
        Row: {
          id: string
          inventory_id: string
          from_location: string
          to_location: string
          quantity: number
          user_id: string
          created_at: string
          notes: string | null
        }
        Insert: {
          id?: string
          inventory_id: string
          from_location: string
          to_location: string
          quantity: number
          user_id: string
          created_at?: string
          notes?: string | null
        }
        Update: {
          id?: string
          inventory_id?: string
          from_location?: string
          to_location?: string
          quantity?: number
          user_id?: string
          created_at?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_inventory_id_fkey"
            columns: ["inventory_id"]
            referencedRelation: "inventory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_from_location_fkey"
            columns: ["from_location"]
            referencedRelation: "warehouse_sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_to_location_fkey"
            columns: ["to_location"]
            referencedRelation: "warehouse_sections"
            referencedColumns: ["id"]
          }
        ]
      }
      inventory_adjustments: {
        Row: {
          id: string
          inventory_id: string
          quantity_before: number
          quantity_after: number
          adjustment_reason: string
          user_id: string
          created_at: string
          notes: string | null
        }
        Insert: {
          id?: string
          inventory_id: string
          quantity_before: number
          quantity_after: number
          adjustment_reason: string
          user_id: string
          created_at?: string
          notes?: string | null
        }
        Update: {
          id?: string
          inventory_id?: string
          quantity_before?: number
          quantity_after?: number
          adjustment_reason?: string
          user_id?: string
          created_at?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_adjustments_inventory_id_fkey"
            columns: ["inventory_id"]
            referencedRelation: "inventory"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}