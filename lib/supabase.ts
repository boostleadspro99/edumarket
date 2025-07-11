import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Types pour TypeScript
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          role: 'CLIENT' | 'SELLER' | 'ADMIN';
          balance_points: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          role?: 'CLIENT' | 'SELLER' | 'ADMIN';
          balance_points?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          role?: 'CLIENT' | 'SELLER' | 'ADMIN';
          balance_points?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      point_packs: {
        Row: {
          id: string;
          name: string;
          price_euro: number;
          points: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          price_euro: number;
          points: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          price_euro?: number;
          points?: number;
          is_active?: boolean;
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          title: string;
          description: string;
          price_points: number;
          file_url: string | null;
          file_path: string | null;
          seller_id: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          price_points: number;
          file_url?: string | null;
          file_path?: string | null;
          seller_id: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          price_points?: number;
          file_url?: string | null;
          file_path?: string | null;
          seller_id?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      purchases: {
        Row: {
          id: string;
          buyer_id: string;
          product_id: string;
          points_spent: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          buyer_id: string;
          product_id: string;
          points_spent: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          buyer_id?: string;
          product_id?: string;
          points_spent?: number;
          created_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          sender_id: string | null;
          receiver_id: string | null;
          product_id: string | null;
          points: number;
          commission: number;
          type: 'PURCHASE' | 'SALE' | 'WITHDRAWAL' | 'POINT_PACK_PURCHASE';
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          sender_id?: string | null;
          receiver_id?: string | null;
          product_id?: string | null;
          points: number;
          commission?: number;
          type: 'PURCHASE' | 'SALE' | 'WITHDRAWAL' | 'POINT_PACK_PURCHASE';
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          sender_id?: string | null;
          receiver_id?: string | null;
          product_id?: string | null;
          points?: number;
          commission?: number;
          type?: 'PURCHASE' | 'SALE' | 'WITHDRAWAL' | 'POINT_PACK_PURCHASE';
          description?: string | null;
          created_at?: string;
        };
      };
      withdrawals: {
        Row: {
          id: string;
          seller_id: string;
          points_requested: number;
          euro_amount: number;
          status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';
          admin_notes: string | null;
          processed_by: string | null;
          created_at: string;
          processed_at: string | null;
        };
        Insert: {
          id?: string;
          seller_id: string;
          points_requested: number;
          euro_amount: number;
          status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';
          admin_notes?: string | null;
          processed_by?: string | null;
          created_at?: string;
          processed_at?: string | null;
        };
        Update: {
          id?: string;
          seller_id?: string;
          points_requested?: number;
          euro_amount?: number;
          status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';
          admin_notes?: string | null;
          processed_by?: string | null;
          created_at?: string;
          processed_at?: string | null;
        };
      };
    };
  };
};

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Product = Database['public']['Tables']['products']['Row'];
export type Purchase = Database['public']['Tables']['purchases']['Row'];
export type PointPack = Database['public']['Tables']['point_packs']['Row'];
export type Transaction = Database['public']['Tables']['transactions']['Row'];
export type Withdrawal = Database['public']['Tables']['withdrawals']['Row'];