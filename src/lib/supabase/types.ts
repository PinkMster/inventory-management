export type Database = {
  public: {
    Tables: {
      inventory: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          quantity: number
          warehouse_id: string
        }
        Insert: {
          name: string
          quantity: number
          warehouse_id: string
        }
        Update: {
          name?: string
          quantity?: number
          warehouse_id?: string
        }
      }
      warehouses: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          location: string
        }
        Insert: {
          name: string
          location: string
        }
        Update: {
          name?: string
          location?: string
        }
      }
      movements: {
        Row: {
          id: string
          created_at: string
          inventory_id: string
          quantity: number
          type: 'in' | 'out'
          notes: string | null
        }
        Insert: {
          inventory_id: string
          quantity: number
          type: 'in' | 'out'
          notes?: string
        }
        Update: {
          quantity?: number
          notes?: string
        }
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