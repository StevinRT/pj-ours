export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      orders: {
        Row: {
          id: string;
          order_number: number;
          source: string;
          customer_name: string;
          customer_phone: string;
          branch: string;
          order_type: string;
          table_number: string | null;
          items: Json;
          subtotal: number;
          packing_charge: number;
          total: number;
          payment_method: string | null;
          special_instructions: string | null;
          pickup_time: string | null;
          status: string;
          is_read: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number?: number;
          source?: string;
          customer_name?: string;
          customer_phone?: string;
          branch: string;
          order_type: string;
          table_number?: string | null;
          items: Json;
          subtotal: number;
          packing_charge?: number;
          total: number;
          payment_method?: string | null;
          special_instructions?: string | null;
          pickup_time?: string | null;
          status?: string;
          is_read?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_number?: number;
          source?: string;
          customer_name?: string;
          customer_phone?: string;
          branch?: string;
          order_type?: string;
          table_number?: string | null;
          items?: Json;
          subtotal?: number;
          packing_charge?: number;
          total?: number;
          payment_method?: string | null;
          special_instructions?: string | null;
          pickup_time?: string | null;
          status?: string;
          is_read?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          name: string;
          price: number;
          category: string;
          icon: string;
          available: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          price: number;
          category: string;
          icon: string;
          available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          price?: number;
          category?: string;
          icon?: string;
          available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
