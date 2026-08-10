export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      models: {
        Row: {
          bio: string | null;
          category: string;
          created_at: string;
          display_name: string;
          gender: string;
          height: number | null;
          id: string;
          languages: string[];
          measurements: Json;
          name: string;
          nationality: string | null;
          status: string;
          updated_at: string;
        };
        Insert: {
          bio?: string | null;
          category: string;
          created_at?: string;
          display_name: string;
          gender: string;
          height?: number | null;
          id?: string;
          languages?: string[];
          measurements?: Json;
          name: string;
          nationality?: string | null;
          status?: string;
          updated_at?: string;
        };
        Update: {
          bio?: string | null;
          category?: string;
          created_at?: string;
          display_name?: string;
          gender?: string;
          height?: number | null;
          id?: string;
          languages?: string[];
          measurements?: Json;
          name?: string;
          nationality?: string | null;
          status?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      portfolios: {
        Row: {
          category: string;
          created_at: string;
          description: string | null;
          id: string;
          model_id: string;
          title: string;
        };
        Insert: {
          category: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          model_id: string;
          title: string;
        };
        Update: {
          category?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          model_id?: string;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "portfolios_model_id_fkey";
            columns: ["model_id"];
            referencedRelation: "models";
            referencedColumns: ["id"];
          },
        ];
      };
      media_assets: {
        Row: {
          file_url: string;
          id: string;
          owner_id: string;
          owner_type: string;
          sort_order: number;
          type: string;
          visibility: string;
        };
        Insert: {
          file_url: string;
          id?: string;
          owner_id: string;
          owner_type: string;
          sort_order?: number;
          type: string;
          visibility?: string;
        };
        Update: {
          file_url?: string;
          id?: string;
          owner_id?: string;
          owner_type?: string;
          sort_order?: number;
          type?: string;
          visibility?: string;
        };
        Relationships: [];
      };
      clients: {
        Row: {
          company_name: string;
          contact_name: string;
          created_at: string;
          email: string;
          id: string;
          phone: string | null;
        };
        Insert: {
          company_name: string;
          contact_name: string;
          created_at?: string;
          email: string;
          id?: string;
          phone?: string | null;
        };
        Update: {
          company_name?: string;
          contact_name?: string;
          created_at?: string;
          email?: string;
          id?: string;
          phone?: string | null;
        };
        Relationships: [];
      };
      bookings: {
        Row: {
          client_id: string;
          created_at: string;
          date: string;
          event_type: string;
          id: string;
          location: string | null;
          model_id: string;
          status: string;
        };
        Insert: {
          client_id: string;
          created_at?: string;
          date: string;
          event_type: string;
          id?: string;
          location?: string | null;
          model_id: string;
          status?: string;
        };
        Update: {
          client_id?: string;
          created_at?: string;
          date?: string;
          event_type?: string;
          id?: string;
          location?: string | null;
          model_id?: string;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bookings_client_id_fkey";
            columns: ["client_id"];
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_model_id_fkey";
            columns: ["model_id"];
            referencedRelation: "models";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
