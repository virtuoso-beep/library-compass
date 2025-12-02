export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      authors: {
        Row: {
          biography: string | null
          created_at: string
          id: string
          name: string
        }
        Insert: {
          biography?: string | null
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          biography?: string | null
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      book_authors: {
        Row: {
          author_id: string
          book_id: string
        }
        Insert: {
          author_id: string
          book_id: string
        }
        Update: {
          author_id?: string
          book_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_authors_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_authors_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      book_copies: {
        Row: {
          accession_number: string
          acquired_date: string
          book_id: string
          condition_notes: string | null
          created_at: string
          id: string
          location: string | null
          status: Database["public"]["Enums"]["book_status"]
          updated_at: string
        }
        Insert: {
          accession_number: string
          acquired_date?: string
          book_id: string
          condition_notes?: string | null
          created_at?: string
          id?: string
          location?: string | null
          status?: Database["public"]["Enums"]["book_status"]
          updated_at?: string
        }
        Update: {
          accession_number?: string
          acquired_date?: string
          book_id?: string
          condition_notes?: string | null
          created_at?: string
          id?: string
          location?: string | null
          status?: Database["public"]["Enums"]["book_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_copies_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      books: {
        Row: {
          call_number: string | null
          category_id: string | null
          cover_image_url: string | null
          created_at: string
          description: string | null
          edition: string | null
          id: string
          isbn: string | null
          language: string | null
          pages: number | null
          publication_year: number | null
          publisher_id: string | null
          resource_type: Database["public"]["Enums"]["resource_type"]
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          call_number?: string | null
          category_id?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          edition?: string | null
          id?: string
          isbn?: string | null
          language?: string | null
          pages?: number | null
          publication_year?: number | null
          publisher_id?: string | null
          resource_type?: Database["public"]["Enums"]["resource_type"]
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          call_number?: string | null
          category_id?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          edition?: string | null
          id?: string
          isbn?: string | null
          language?: string | null
          pages?: number | null
          publication_year?: number | null
          publisher_id?: string | null
          resource_type?: Database["public"]["Enums"]["resource_type"]
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "books_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "books_publisher_id_fkey"
            columns: ["publisher_id"]
            isOneToOne: false
            referencedRelation: "publishers"
            referencedColumns: ["id"]
          },
        ]
      }
      borrowing_transactions: {
        Row: {
          book_copy_id: string
          borrowed_date: string
          created_at: string
          due_date: string
          id: string
          member_id: string
          renewal_count: number
          return_date: string | null
          staff_user_id: string | null
          updated_at: string
        }
        Insert: {
          book_copy_id: string
          borrowed_date?: string
          created_at?: string
          due_date: string
          id?: string
          member_id: string
          renewal_count?: number
          return_date?: string | null
          staff_user_id?: string | null
          updated_at?: string
        }
        Update: {
          book_copy_id?: string
          borrowed_date?: string
          created_at?: string
          due_date?: string
          id?: string
          member_id?: string
          renewal_count?: number
          return_date?: string | null
          staff_user_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "borrowing_transactions_book_copy_id_fkey"
            columns: ["book_copy_id"]
            isOneToOne: false
            referencedRelation: "book_copies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "borrowing_transactions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      fines: {
        Row: {
          amount: number
          created_at: string
          id: string
          member_id: string
          paid: boolean
          payment_date: string | null
          reason: string
          transaction_id: string | null
          updated_at: string
          waived: boolean
          waiver_reason: string | null
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          member_id: string
          paid?: boolean
          payment_date?: string | null
          reason: string
          transaction_id?: string | null
          updated_at?: string
          waived?: boolean
          waiver_reason?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          member_id?: string
          paid?: boolean
          payment_date?: string | null
          reason?: string
          transaction_id?: string | null
          updated_at?: string
          waived?: boolean
          waiver_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fines_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fines_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "borrowing_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          address: string | null
          borrowing_period_days: number
          created_at: string
          email: string
          expiration_date: string | null
          fine_rate_per_day: number
          full_name: string
          id: string
          max_books_allowed: number
          member_id: string
          member_type: Database["public"]["Enums"]["member_type"]
          phone: string | null
          photo_url: string | null
          registration_date: string
          renewal_limit: number
          status: Database["public"]["Enums"]["member_status"]
          updated_at: string
        }
        Insert: {
          address?: string | null
          borrowing_period_days?: number
          created_at?: string
          email: string
          expiration_date?: string | null
          fine_rate_per_day?: number
          full_name: string
          id?: string
          max_books_allowed?: number
          member_id: string
          member_type?: Database["public"]["Enums"]["member_type"]
          phone?: string | null
          photo_url?: string | null
          registration_date?: string
          renewal_limit?: number
          status?: Database["public"]["Enums"]["member_status"]
          updated_at?: string
        }
        Update: {
          address?: string | null
          borrowing_period_days?: number
          created_at?: string
          email?: string
          expiration_date?: string | null
          fine_rate_per_day?: number
          full_name?: string
          id?: string
          max_books_allowed?: number
          member_id?: string
          member_type?: Database["public"]["Enums"]["member_type"]
          phone?: string | null
          photo_url?: string | null
          registration_date?: string
          renewal_limit?: number
          status?: Database["public"]["Enums"]["member_status"]
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          photo_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id: string
          photo_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          photo_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      publishers: {
        Row: {
          address: string | null
          created_at: string
          id: string
          name: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      reservations: {
        Row: {
          book_id: string
          cancelled: boolean
          created_at: string
          expiration_date: string
          fulfilled: boolean
          id: string
          member_id: string
          reservation_date: string
          updated_at: string
        }
        Insert: {
          book_id: string
          cancelled?: boolean
          created_at?: string
          expiration_date: string
          fulfilled?: boolean
          id?: string
          member_id: string
          reservation_date?: string
          updated_at?: string
        }
        Update: {
          book_id?: string
          cancelled?: boolean
          created_at?: string
          expiration_date?: string
          fulfilled?: boolean
          id?: string
          member_id?: string
          reservation_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "staff" | "member"
      book_status:
        | "available"
        | "borrowed"
        | "reserved"
        | "lost"
        | "damaged"
        | "for_repair"
      member_status: "active" | "inactive" | "suspended" | "expired"
      member_type: "student" | "faculty" | "staff_member" | "guest"
      resource_type: "book" | "periodical" | "thesis" | "ebook" | "audiovisual"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "staff", "member"],
      book_status: [
        "available",
        "borrowed",
        "reserved",
        "lost",
        "damaged",
        "for_repair",
      ],
      member_status: ["active", "inactive", "suspended", "expired"],
      member_type: ["student", "faculty", "staff_member", "guest"],
      resource_type: ["book", "periodical", "thesis", "ebook", "audiovisual"],
    },
  },
} as const
