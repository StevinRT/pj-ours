export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      daily_sales: {
        Row: {
          id: string;
          sale_date: string;
          total_orders: number;
          total_sales: number;
          cash_sales: number;
          upi_sales: number;
          card_sales: number;
          east_fort_sales: number;
          west_fort_sales: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          sale_date: string;
          total_orders?: number;
          total_sales?: number;
          cash_sales?: number;
          upi_sales?: number;
          card_sales?: number;
          east_fort_sales?: number;
          west_fort_sales?: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          sale_date?: string;
          total_orders?: number;
          total_sales?: number;
          cash_sales?: number;
          upi_sales?: number;
          card_sales?: number;
          east_fort_sales?: number;
          west_fort_sales?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
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
    Functions: {
      reconcile_daily_sales: {
        Args: Record<string, never>;
        Returns: undefined;
      };
      cleanup_old_orders: {
        Args: Record<string, never>;
        Returns: number;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
