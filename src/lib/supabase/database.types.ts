export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15";
  };
  public: {
    Tables: {
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
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_model_id_fkey";
            columns: ["model_id"];
            isOneToOne: false;
            referencedRelation: "models";
            referencedColumns: ["id"];
          },
        ];
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
      model_social_links: {
        Row: {
          created_at: string;
          id: string;
          label: string;
          model_id: string;
          platform: string;
          sort_order: number;
          url: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          label: string;
          model_id: string;
          platform: string;
          sort_order?: number;
          url: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          label?: string;
          model_id?: string;
          platform?: string;
          sort_order?: number;
          url?: string;
        };
        Relationships: [
          {
            foreignKeyName: "model_social_links_model_id_fkey";
            columns: ["model_id"];
            isOneToOne: false;
            referencedRelation: "models";
            referencedColumns: ["id"];
          },
        ];
      };
      model_video_links: {
        Row: {
          created_at: string;
          id: string;
          model_id: string;
          sort_order: number;
          title: string;
          youtube_url: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          model_id: string;
          sort_order?: number;
          title: string;
          youtube_url: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          model_id?: string;
          sort_order?: number;
          title?: string;
          youtube_url?: string;
        };
        Relationships: [
          {
            foreignKeyName: "model_video_links_model_id_fkey";
            columns: ["model_id"];
            isOneToOne: false;
            referencedRelation: "models";
            referencedColumns: ["id"];
          },
        ];
      };
      models: {
        Row: {
          bio: string | null;
          bio_en: string | null;
          bio_zh: string | null;
          board: string;
          category: string;
          city: string | null;
          city_zh: string | null;
          created_at: string;
          display_name: string;
          featured: boolean;
          gender: string;
          height: number | null;
          id: string;
          languages: string[];
          measurements: Json;
          name: string;
          name_zh: string | null;
          nationality: string | null;
          slug: string;
          status: string;
          stats: Json;
          tags: string[];
          updated_at: string;
        };
        Insert: {
          bio?: string | null;
          bio_en?: string | null;
          bio_zh?: string | null;
          board?: string;
          category: string;
          city?: string | null;
          city_zh?: string | null;
          created_at?: string;
          display_name: string;
          featured?: boolean;
          gender: string;
          height?: number | null;
          id?: string;
          languages?: string[];
          measurements?: Json;
          name: string;
          name_zh?: string | null;
          nationality?: string | null;
          slug?: string;
          status?: string;
          stats?: Json;
          tags?: string[];
          updated_at?: string;
        };
        Update: {
          bio?: string | null;
          bio_en?: string | null;
          bio_zh?: string | null;
          board?: string;
          category?: string;
          city?: string | null;
          city_zh?: string | null;
          created_at?: string;
          display_name?: string;
          featured?: boolean;
          gender?: string;
          height?: number | null;
          id?: string;
          languages?: string[];
          measurements?: Json;
          name?: string;
          name_zh?: string | null;
          nationality?: string | null;
          slug?: string;
          status?: string;
          stats?: Json;
          tags?: string[];
          updated_at?: string;
        };
        Relationships: [];
      };
      site_settings: {
        Row: {
          id: string;
          admin_email: string;
          about_published: boolean;
          about_title_en: string;
          about_title_zh: string;
          about_body_en: string[];
          about_body_zh: string[];
          offices: Json;
          messenger_url: string | null;
          line_oa_url: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          admin_email?: string;
          about_published?: boolean;
          about_title_en?: string;
          about_title_zh?: string;
          about_body_en?: string[];
          about_body_zh?: string[];
          offices?: Json;
          messenger_url?: string | null;
          line_oa_url?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          admin_email?: string;
          about_published?: boolean;
          about_title_en?: string;
          about_title_zh?: string;
          about_body_en?: string[];
          about_body_zh?: string[];
          offices?: Json;
          messenger_url?: string | null;
          line_oa_url?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      news_posts: {
        Row: {
          id: string;
          slug: string;
          date: string;
          title_en: string;
          title_zh: string;
          excerpt_en: string;
          excerpt_zh: string;
          body_en: string[];
          body_zh: string[];
          cover_url: string | null;
          tags: string[];
          status: string;
          created_at: string;
          updated_at: string;
          published_at: string | null;
        };
        Insert: {
          id?: string;
          slug: string;
          date?: string;
          title_en: string;
          title_zh: string;
          excerpt_en?: string;
          excerpt_zh?: string;
          body_en?: string[];
          body_zh?: string[];
          cover_url?: string | null;
          tags?: string[];
          status?: string;
          created_at?: string;
          updated_at?: string;
          published_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["news_posts"]["Insert"]>;
        Relationships: [];
      };
      assistant_knowledge_documents: {
        Row: {
          id: string;
          title_en: string;
          title_zh: string;
          content_en: string;
          content_zh: string;
          source_type: string;
          source_url: string | null;
          tags: string[];
          published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title_en: string;
          title_zh: string;
          content_en: string;
          content_zh: string;
          source_type?: string;
          source_url?: string | null;
          tags?: string[];
          published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["assistant_knowledge_documents"]["Insert"]>;
        Relationships: [];
      };
      inquiries: {
        Row: {
          id: string;
          kind: string;
          enquiry_type: string;
          name: string;
          company: string | null;
          email: string;
          phone: string | null;
          subject: string | null;
          budget: string | null;
          message: string;
          details: Json;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          kind?: string;
          enquiry_type?: string;
          name: string;
          company?: string | null;
          email: string;
          phone?: string | null;
          subject?: string | null;
          budget?: string | null;
          message: string;
          details?: Json;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["inquiries"]["Insert"]>;
        Relationships: [];
      };
      scout_applications: {
        Row: {
          id: string;
          name: string;
          age: number | null;
          city: string;
          email: string;
          phone: string | null;
          height: string | null;
          measurements: string | null;
          instagram: string | null;
          social_links: string | null;
          message: string | null;
          attachments: Json;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          age?: number | null;
          city: string;
          email: string;
          phone?: string | null;
          height?: string | null;
          measurements?: string | null;
          instagram?: string | null;
          social_links?: string | null;
          message?: string | null;
          attachments?: Json;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["scout_applications"]["Insert"]>;
        Relationships: [];
      };
      admin_notifications: {
        Row: {
          id: string;
          kind: string;
          reference_id: string;
          recipient_email: string;
          subject: string;
          status: string;
          error: string | null;
          created_at: string;
          sent_at: string | null;
        };
        Insert: {
          id?: string;
          kind: string;
          reference_id: string;
          recipient_email: string;
          subject: string;
          status?: string;
          error?: string | null;
          created_at?: string;
          sent_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["admin_notifications"]["Insert"]>;
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
            isOneToOne: false;
            referencedRelation: "models";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      current_app_role: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
