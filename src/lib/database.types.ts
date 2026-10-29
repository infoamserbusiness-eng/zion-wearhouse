export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          diff_json: Json | null
          entity: string
          entity_id: string | null
          id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          diff_json?: Json | null
          entity: string
          entity_id?: string | null
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          diff_json?: Json | null
          entity?: string
          entity_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_shifts: {
        Row: {
          closed_at: string | null
          count_cents: number | null
          id: string
          location_id: string
          opened_at: string
          opening_cents: number
          sales_card_cents: number
          sales_cash_cents: number
          sales_transfer_cents: number
          staff_id: string | null
          status: Database["public"]["Enums"]["shift_status"]
        }
        Insert: {
          closed_at?: string | null
          count_cents?: number | null
          id?: string
          location_id: string
          opened_at?: string
          opening_cents?: number
          sales_card_cents?: number
          sales_cash_cents?: number
          sales_transfer_cents?: number
          staff_id?: string | null
          status?: Database["public"]["Enums"]["shift_status"]
        }
        Update: {
          closed_at?: string | null
          count_cents?: number | null
          id?: string
          location_id?: string
          opened_at?: string
          opening_cents?: number
          sales_card_cents?: number
          sales_cash_cents?: number
          sales_transfer_cents?: number
          staff_id?: string | null
          status?: Database["public"]["Enums"]["shift_status"]
        }
        Relationships: [
          {
            foreignKeyName: "cash_shifts_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_shifts_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          id: string
          is_active: boolean
          name: string
          nav_visible: boolean
          position: number
          slug: string
        }
        Insert: {
          id?: string
          is_active?: boolean
          name: string
          nav_visible?: boolean
          position?: number
          slug: string
        }
        Update: {
          id?: string
          is_active?: boolean
          name?: string
          nav_visible?: boolean
          position?: number
          slug?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          created_at: string
          doc: string | null
          doc_type: string | null
          email: string | null
          full_name: string
          id: string
          marketing_opt_in: boolean
          phone: string | null
          source: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          doc?: string | null
          doc_type?: string | null
          email?: string | null
          full_name: string
          id?: string
          marketing_opt_in?: boolean
          phone?: string | null
          source?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          doc?: string | null
          doc_type?: string | null
          email?: string | null
          full_name?: string
          id?: string
          marketing_opt_in?: boolean
          phone?: string | null
          source?: string | null
        }
        Relationships: []
      }
      inventory: {
        Row: {
          location_id: string
          min_qty: number
          qty: number
          updated_at: string
          variant_id: string
        }
        Insert: {
          location_id: string
          min_qty?: number
          qty?: number
          updated_at?: string
          variant_id: string
        }
        Update: {
          location_id?: string
          min_qty?: number
          qty?: number
          updated_at?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_movements: {
        Row: {
          created_at: string
          created_by: string | null
          delta: number
          id: string
          location_id: string
          note: string | null
          reason: string
          ref: string | null
          variant_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          delta: number
          id?: string
          location_id: string
          note?: string | null
          reason: string
          ref?: string | null
          variant_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          delta?: number
          id?: string
          location_id?: string
          note?: string | null
          reason?: string
          ref?: string | null
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          position: number
          short_name: string | null
          type: Database["public"]["Enums"]["location_type"]
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          position?: number
          short_name?: string | null
          type: Database["public"]["Enums"]["location_type"]
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          position?: number
          short_name?: string | null
          type?: Database["public"]["Enums"]["location_type"]
        }
        Relationships: []
      }
      pos_sale_lines: {
        Row: {
          id: string
          qty: number
          sale_id: string
          unit_price_cents: number
          variant_id: string | null
        }
        Insert: {
          id?: string
          qty: number
          sale_id: string
          unit_price_cents: number
          variant_id?: string | null
        }
        Update: {
          id?: string
          qty?: number
          sale_id?: string
          unit_price_cents?: number
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pos_sale_lines_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "pos_sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_sale_lines_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      pos_sales: {
        Row: {
          code: string | null
          customer_id: string | null
          id: string
          invoice_number: string | null
          invoice_status: string
          location_id: string
          payment_method: string
          sold_at: string
          staff_id: string | null
          total_cents: number
        }
        Insert: {
          code?: string | null
          customer_id?: string | null
          id?: string
          invoice_number?: string | null
          invoice_status?: string
          location_id: string
          payment_method: string
          sold_at?: string
          staff_id?: string | null
          total_cents?: number
        }
        Update: {
          code?: string | null
          customer_id?: string | null
          id?: string
          invoice_number?: string | null
          invoice_status?: string
          location_id?: string
          payment_method?: string
          sold_at?: string
          staff_id?: string | null
          total_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "pos_sales_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_sales_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_sales_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt: string | null
          id: string
          position: number
          product_id: string
          storage_path: string
        }
        Insert: {
          alt?: string | null
          id?: string
          position?: number
          product_id: string
          storage_path: string
        }
        Update: {
          alt?: string | null
          id?: string
          position?: number
          product_id?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_option_values: {
        Row: {
          id: string
          option_id: string
          position: number
          value: string
        }
        Insert: {
          id?: string
          option_id: string
          position?: number
          value: string
        }
        Update: {
          id?: string
          option_id?: string
          position?: number
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_option_values_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "product_options"
            referencedColumns: ["id"]
          },
        ]
      }
      product_options: {
        Row: {
          id: string
          name: string
          position: number
          product_id: string
        }
        Insert: {
          id?: string
          name: string
          position?: number
          product_id: string
        }
        Update: {
          id?: string
          name?: string
          position?: number
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_options_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          barcode: string | null
          id: string
          is_active: boolean
          option_values_json: Json
          price_cents: number | null
          product_id: string
          sku: string | null
        }
        Insert: {
          barcode?: string | null
          id?: string
          is_active?: boolean
          option_values_json?: Json
          price_cents?: number | null
          product_id: string
          sku?: string | null
        }
        Update: {
          barcode?: string | null
          id?: string
          is_active?: boolean
          option_values_json?: Json
          price_cents?: number | null
          product_id?: string
          sku?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          avg_cost_cents: number
          base_price_cents: number
          brand: string | null
          category_id: string | null
          commission_pct: number
          created_at: string
          created_by: string | null
          currency: string
          description: string | null
          id: string
          name: string
          origin: Database["public"]["Enums"]["origin_country"]
          published_at: string | null
          search_tsv: unknown
          sku: string | null
          slug: string | null
          status: Database["public"]["Enums"]["product_status"]
          subcategory_id: string | null
          updated_at: string
          weight_grams: number
        }
        Insert: {
          avg_cost_cents?: number
          base_price_cents?: number
          brand?: string | null
          category_id?: string | null
          commission_pct?: number
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          id?: string
          name: string
          origin?: Database["public"]["Enums"]["origin_country"]
          published_at?: string | null
          search_tsv?: unknown
          sku?: string | null
          slug?: string | null
          status?: Database["public"]["Enums"]["product_status"]
          subcategory_id?: string | null
          updated_at?: string
          weight_grams?: number
        }
        Update: {
          avg_cost_cents?: number
          base_price_cents?: number
          brand?: string | null
          category_id?: string | null
          commission_pct?: number
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          id?: string
          name?: string
          origin?: Database["public"]["Enums"]["origin_country"]
          published_at?: string | null
          search_tsv?: unknown
          sku?: string | null
          slug?: string | null
          status?: Database["public"]["Enums"]["product_status"]
          subcategory_id?: string | null
          updated_at?: string
          weight_grams?: number
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          is_active: boolean
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          store_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          is_active?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          store_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          store_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_store_fk"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      purchases: {
        Row: {
          commission_pct: number | null
          id: string
          location_id: string
          photo_path: string | null
          pvp_cents: number | null
          qty: number
          received_at: string
          received_by: string | null
          supplier_ref: string | null
          unit_cost_cents: number
          variant_id: string
        }
        Insert: {
          commission_pct?: number | null
          id?: string
          location_id: string
          photo_path?: string | null
          pvp_cents?: number | null
          qty: number
          received_at?: string
          received_by?: string | null
          supplier_ref?: string | null
          unit_cost_cents: number
          variant_id: string
        }
        Update: {
          commission_pct?: number | null
          id?: string
          location_id?: string
          photo_path?: string | null
          pvp_cents?: number | null
          qty?: number
          received_at?: string
          received_by?: string | null
          supplier_ref?: string | null
          unit_cost_cents?: number
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_received_by_fkey"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      restock_requests: {
        Row: {
          created_at: string
          id: string
          location_id: string
          qty: number
          requested_by: string | null
          status: string
          variant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          location_id: string
          qty: number
          requested_by?: string | null
          status?: string
          variant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          location_id?: string
          qty?: number
          requested_by?: string | null
          status?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "restock_requests_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restock_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restock_requests_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          key: string
          updated_at: string
          updated_by: string | null
          value_json: Json
        }
        Insert: {
          key: string
          updated_at?: string
          updated_by?: string | null
          value_json: Json
        }
        Update: {
          key?: string
          updated_at?: string
          updated_by?: string | null
          value_json?: Json
        }
        Relationships: [
          {
            foreignKeyName: "settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_return_lines: {
        Row: {
          id: string
          note: string | null
          qty: number
          return_id: string
          variant_id: string
        }
        Insert: {
          id?: string
          note?: string | null
          qty: number
          return_id: string
          variant_id: string
        }
        Update: {
          id?: string
          note?: string | null
          qty?: number
          return_id?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_return_lines_return_id_fkey"
            columns: ["return_id"]
            isOneToOne: false
            referencedRelation: "stock_returns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_return_lines_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_returns: {
        Row: {
          code: string | null
          created_at: string
          created_by: string | null
          from_location_id: string
          id: string
          received_at: string | null
          ref_transfer_id: string | null
          status: Database["public"]["Enums"]["return_status"]
        }
        Insert: {
          code?: string | null
          created_at?: string
          created_by?: string | null
          from_location_id: string
          id?: string
          received_at?: string | null
          ref_transfer_id?: string | null
          status?: Database["public"]["Enums"]["return_status"]
        }
        Update: {
          code?: string | null
          created_at?: string
          created_by?: string | null
          from_location_id?: string
          id?: string
          received_at?: string | null
          ref_transfer_id?: string | null
          status?: Database["public"]["Enums"]["return_status"]
        }
        Relationships: [
          {
            foreignKeyName: "stock_returns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_returns_from_location_id_fkey"
            columns: ["from_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_returns_ref_transfer_id_fkey"
            columns: ["ref_transfer_id"]
            isOneToOne: false
            referencedRelation: "stock_transfers"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_transfer_lines: {
        Row: {
          id: string
          note: string | null
          qty_received: number | null
          qty_sent: number
          return_to_warehouse: boolean
          transfer_id: string
          variant_id: string
        }
        Insert: {
          id?: string
          note?: string | null
          qty_received?: number | null
          qty_sent: number
          return_to_warehouse?: boolean
          transfer_id: string
          variant_id: string
        }
        Update: {
          id?: string
          note?: string | null
          qty_received?: number | null
          qty_sent?: number
          return_to_warehouse?: boolean
          transfer_id?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_transfer_lines_transfer_id_fkey"
            columns: ["transfer_id"]
            isOneToOne: false
            referencedRelation: "stock_transfers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_transfer_lines_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_transfers: {
        Row: {
          code: string | null
          created_by: string | null
          from_location_id: string
          id: string
          note: string | null
          received_at: string | null
          received_by: string | null
          sent_at: string
          status: Database["public"]["Enums"]["transfer_status"]
          to_location_id: string
          variance_count: number
        }
        Insert: {
          code?: string | null
          created_by?: string | null
          from_location_id: string
          id?: string
          note?: string | null
          received_at?: string | null
          received_by?: string | null
          sent_at?: string
          status?: Database["public"]["Enums"]["transfer_status"]
          to_location_id: string
          variance_count?: number
        }
        Update: {
          code?: string | null
          created_by?: string | null
          from_location_id?: string
          id?: string
          note?: string | null
          received_at?: string | null
          received_by?: string | null
          sent_at?: string
          status?: Database["public"]["Enums"]["transfer_status"]
          to_location_id?: string
          variance_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "stock_transfers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_transfers_from_location_id_fkey"
            columns: ["from_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_transfers_received_by_fkey"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_transfers_to_location_id_fkey"
            columns: ["to_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      subcategories: {
        Row: {
          category_id: string
          id: string
          name: string
          position: number
          slug: string
        }
        Insert: {
          category_id: string
          id?: string
          name: string
          position?: number
          slug: string
        }
        Update: {
          category_id?: string
          id?: string
          name?: string
          position?: number
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auth_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean }
      is_staff: { Args: Record<PropertyKey, never>; Returns: boolean }
    }
    Enums: {
      location_type: "warehouse" | "store"
      origin_country: "US" | "EC"
      product_status: "draft" | "active" | "archived"
      return_status: "pending" | "received"
      shift_status: "open" | "closed"
      transfer_status:
        | "draft"
        | "in_transit"
        | "received_ok"
        | "received_variance"
        | "cancelled"
      user_role: "customer" | "staff" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
