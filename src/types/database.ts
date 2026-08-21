// Généré depuis le schéma Supabase (mcp generate_typescript_types).
// Ne pas éditer à la main — régénérer après toute migration de schéma.

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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      allocations: {
        Row: {
          article_attribuable_id: string
          etat: string | null
          family_member_id: string | null
          id: string
          quantite: number
        }
        Insert: {
          article_attribuable_id: string
          etat?: string | null
          family_member_id?: string | null
          id?: string
          quantite?: number
        }
        Update: {
          article_attribuable_id?: string
          etat?: string | null
          family_member_id?: string | null
          id?: string
          quantite?: number
        }
        Relationships: [
          {
            foreignKeyName: "allocations_article_attribuable_id_fkey"
            columns: ["article_attribuable_id"]
            isOneToOne: false
            referencedRelation: "articles_attribuables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "allocations_family_member_id_fkey"
            columns: ["family_member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
        ]
      }
      annees_scolaires: {
        Row: {
          active: boolean
          created_at: string
          date_debut_visibilite: string
          date_fin_visibilite: string
          foyer_id: string
          id: string
          label: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          date_debut_visibilite: string
          date_fin_visibilite: string
          foyer_id: string
          id?: string
          label: string
        }
        Update: {
          active?: boolean
          created_at?: string
          date_debut_visibilite?: string
          date_fin_visibilite?: string
          foyer_id?: string
          id?: string
          label?: string
        }
        Relationships: [
          {
            foreignKeyName: "annees_scolaires_foyer_id_fkey"
            columns: ["foyer_id"]
            isOneToOne: false
            referencedRelation: "foyers"
            referencedColumns: ["id"]
          },
        ]
      }
      articles_attribuables: {
        Row: {
          annee_scolaire_id: string
          article: string
          categorie: string | null
          foyer_id: string
          id: string
          notes: string | null
          quantite_totale: number
        }
        Insert: {
          annee_scolaire_id: string
          article: string
          categorie?: string | null
          foyer_id: string
          id?: string
          notes?: string | null
          quantite_totale?: number
        }
        Update: {
          annee_scolaire_id?: string
          article?: string
          categorie?: string | null
          foyer_id?: string
          id?: string
          notes?: string | null
          quantite_totale?: number
        }
        Relationships: [
          {
            foreignKeyName: "articles_attribuables_annee_scolaire_id_fkey"
            columns: ["annee_scolaire_id"]
            isOneToOne: false
            referencedRelation: "annees_scolaires"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_attribuables_foyer_id_fkey"
            columns: ["foyer_id"]
            isOneToOne: false
            referencedRelation: "foyers"
            referencedColumns: ["id"]
          },
        ]
      }
      depenses: {
        Row: {
          annee_scolaire_id: string
          created_at: string
          description: string | null
          foyer_id: string
          id: string
          montant: number
          ticket_url: string | null
        }
        Insert: {
          annee_scolaire_id: string
          created_at?: string
          description?: string | null
          foyer_id: string
          id?: string
          montant: number
          ticket_url?: string | null
        }
        Update: {
          annee_scolaire_id?: string
          created_at?: string
          description?: string | null
          foyer_id?: string
          id?: string
          montant?: number
          ticket_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "depenses_annee_scolaire_id_fkey"
            columns: ["annee_scolaire_id"]
            isOneToOne: false
            referencedRelation: "annees_scolaires"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "depenses_foyer_id_fkey"
            columns: ["foyer_id"]
            isOneToOne: false
            referencedRelation: "foyers"
            referencedColumns: ["id"]
          },
        ]
      }
      family_members: {
        Row: {
          couleur: string
          created_at: string
          date_naissance: string | null
          emoji: string
          foyer_id: string
          id: string
          niveau: string
          nom: string
          updated_at: string
        }
        Insert: {
          couleur?: string
          created_at?: string
          date_naissance?: string | null
          emoji?: string
          foyer_id: string
          id?: string
          niveau: string
          nom: string
          updated_at?: string
        }
        Update: {
          couleur?: string
          created_at?: string
          date_naissance?: string | null
          emoji?: string
          foyer_id?: string
          id?: string
          niveau?: string
          nom?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_members_foyer_id_fkey"
            columns: ["foyer_id"]
            isOneToOne: false
            referencedRelation: "foyers"
            referencedColumns: ["id"]
          },
        ]
      }
      fourniture_items: {
        Row: {
          annee_scolaire_id: string
          categorie: string | null
          family_member_id: string
          foyer_id: string
          id: string
          item: string
          matiere_id: string | null
          notes: string | null
          ordre: number
          qte_couverte: number
          qte_demandee: number
          section: string
          statut: string
        }
        Insert: {
          annee_scolaire_id: string
          categorie?: string | null
          family_member_id: string
          foyer_id: string
          id?: string
          item: string
          matiere_id?: string | null
          notes?: string | null
          ordre?: number
          qte_couverte?: number
          qte_demandee?: number
          section: string
          statut?: string
        }
        Update: {
          annee_scolaire_id?: string
          categorie?: string | null
          family_member_id?: string
          foyer_id?: string
          id?: string
          item?: string
          matiere_id?: string | null
          notes?: string | null
          ordre?: number
          qte_couverte?: number
          qte_demandee?: number
          section?: string
          statut?: string
        }
        Relationships: [
          {
            foreignKeyName: "fourniture_items_annee_scolaire_id_fkey"
            columns: ["annee_scolaire_id"]
            isOneToOne: false
            referencedRelation: "annees_scolaires"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fourniture_items_family_member_id_fkey"
            columns: ["family_member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fourniture_items_foyer_id_fkey"
            columns: ["foyer_id"]
            isOneToOne: false
            referencedRelation: "foyers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fourniture_items_matiere_id_fkey"
            columns: ["matiere_id"]
            isOneToOne: false
            referencedRelation: "matieres"
            referencedColumns: ["id"]
          },
        ]
      }
      foyer_membres_comptes: {
        Row: {
          created_at: string
          foyer_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          foyer_id: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          foyer_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "foyer_membres_comptes_foyer_id_fkey"
            columns: ["foyer_id"]
            isOneToOne: false
            referencedRelation: "foyers"
            referencedColumns: ["id"]
          },
        ]
      }
      foyers: {
        Row: {
          created_at: string
          id: string
          nom: string
        }
        Insert: {
          created_at?: string
          id?: string
          nom: string
        }
        Update: {
          created_at?: string
          id?: string
          nom?: string
        }
        Relationships: []
      }
      invitations: {
        Row: {
          code: string
          created_at: string
          created_by: string
          expires_at: string
          foyer_id: string
          id: string
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by: string
          expires_at?: string
          foyer_id: string
          id?: string
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string
          expires_at?: string
          foyer_id?: string
          id?: string
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitations_foyer_id_fkey"
            columns: ["foyer_id"]
            isOneToOne: false
            referencedRelation: "foyers"
            referencedColumns: ["id"]
          },
        ]
      }
      listes_importees: {
        Row: {
          annee_scolaire_id: string
          created_at: string
          family_member_id: string | null
          fichier_url: string
          foyer_id: string
          id: string
          statut_extraction: string
          type_fichier: string
        }
        Insert: {
          annee_scolaire_id: string
          created_at?: string
          family_member_id?: string | null
          fichier_url: string
          foyer_id: string
          id?: string
          statut_extraction?: string
          type_fichier: string
        }
        Update: {
          annee_scolaire_id?: string
          created_at?: string
          family_member_id?: string | null
          fichier_url?: string
          foyer_id?: string
          id?: string
          statut_extraction?: string
          type_fichier?: string
        }
        Relationships: [
          {
            foreignKeyName: "listes_importees_annee_scolaire_id_fkey"
            columns: ["annee_scolaire_id"]
            isOneToOne: false
            referencedRelation: "annees_scolaires"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listes_importees_family_member_id_fkey"
            columns: ["family_member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listes_importees_foyer_id_fkey"
            columns: ["foyer_id"]
            isOneToOne: false
            referencedRelation: "foyers"
            referencedColumns: ["id"]
          },
        ]
      }
      matieres: {
        Row: {
          active: boolean
          annee_scolaire_id: string
          couleur: string | null
          created_at: string
          family_member_id: string
          foyer_id: string
          id: string
          nom: string
          notes: string | null
          spec_fournitures: string | null
        }
        Insert: {
          active?: boolean
          annee_scolaire_id: string
          couleur?: string | null
          created_at?: string
          family_member_id: string
          foyer_id: string
          id?: string
          nom: string
          notes?: string | null
          spec_fournitures?: string | null
        }
        Update: {
          active?: boolean
          annee_scolaire_id?: string
          couleur?: string | null
          created_at?: string
          family_member_id?: string
          foyer_id?: string
          id?: string
          nom?: string
          notes?: string | null
          spec_fournitures?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matieres_annee_scolaire_id_fkey"
            columns: ["annee_scolaire_id"]
            isOneToOne: false
            referencedRelation: "annees_scolaires"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matieres_family_member_id_fkey"
            columns: ["family_member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matieres_foyer_id_fkey"
            columns: ["foyer_id"]
            isOneToOne: false
            referencedRelation: "foyers"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_commun: {
        Row: {
          annee_scolaire_id: string
          article: string
          categorie: string | null
          foyer_id: string
          id: string
          notes: string | null
          quantite_totale: number
        }
        Insert: {
          annee_scolaire_id: string
          article: string
          categorie?: string | null
          foyer_id: string
          id?: string
          notes?: string | null
          quantite_totale?: number
        }
        Update: {
          annee_scolaire_id?: string
          article?: string
          categorie?: string | null
          foyer_id?: string
          id?: string
          notes?: string | null
          quantite_totale?: number
        }
        Relationships: [
          {
            foreignKeyName: "stock_commun_annee_scolaire_id_fkey"
            columns: ["annee_scolaire_id"]
            isOneToOne: false
            referencedRelation: "annees_scolaires"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_commun_foyer_id_fkey"
            columns: ["foyer_id"]
            isOneToOne: false
            referencedRelation: "foyers"
            referencedColumns: ["id"]
          },
        ]
      }
      trousse_check_items: {
        Row: {
          annee_scolaire_id: string
          checked: boolean
          family_member_id: string
          foyer_id: string
          id: string
          item: string
          ordre: number
        }
        Insert: {
          annee_scolaire_id: string
          checked?: boolean
          family_member_id: string
          foyer_id: string
          id?: string
          item: string
          ordre?: number
        }
        Update: {
          annee_scolaire_id?: string
          checked?: boolean
          family_member_id?: string
          foyer_id?: string
          id?: string
          item?: string
          ordre?: number
        }
        Relationships: [
          {
            foreignKeyName: "trousse_check_items_annee_scolaire_id_fkey"
            columns: ["annee_scolaire_id"]
            isOneToOne: false
            referencedRelation: "annees_scolaires"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trousse_check_items_family_member_id_fkey"
            columns: ["family_member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trousse_check_items_foyer_id_fkey"
            columns: ["foyer_id"]
            isOneToOne: false
            referencedRelation: "foyers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_foyer: { Args: { p_nom: string }; Returns: string }
      create_invitation: { Args: { p_foyer_id: string }; Returns: string }
      est_rentree_visible: {
        Args: { p_at?: string; p_date_debut: string; p_date_fin: string }
        Returns: boolean
      }
      foyer_membres_emails: {
        Args: { p_foyer_id: string }
        Returns: {
          created_at: string
          email: string
          role: string
          user_id: string
        }[]
      }
      join_foyer_with_code: { Args: { p_code: string }; Returns: string }
      my_foyer_ids: { Args: never; Returns: string[] }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
