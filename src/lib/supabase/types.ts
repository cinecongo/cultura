export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.18';
  };
  public: {
    Tables: {
      acteurs_culturels: {
        Row: {
          bio: string | null;
          commune: string | null;
          created_at: string;
          cree_par: string | null;
          email_contact: string | null;
          genre: string | null;
          id: string;
          liens: Json | null;
          nom: string;
          photo: string | null;
          source_url: string | null;
          statut_fiche: string;
          telephone: string | null;
          type: string;
          user_id: string | null;
          verified: boolean | null;
          verified_at: string | null;
          verified_by: string | null;
          ville: string | null;
        };
        ComputedFields: never;
        Insert: {
          bio?: string | null;
          commune?: string | null;
          created_at?: string;
          cree_par?: string | null;
          email_contact?: string | null;
          genre?: string | null;
          id: string;
          liens?: Json | null;
          nom: string;
          photo?: string | null;
          source_url?: string | null;
          statut_fiche?: string;
          telephone?: string | null;
          type: string;
          user_id?: string | null;
          verified?: boolean | null;
          verified_at?: string | null;
          verified_by?: string | null;
          ville?: string | null;
        };
        Update: {
          bio?: string | null;
          commune?: string | null;
          created_at?: string;
          cree_par?: string | null;
          email_contact?: string | null;
          genre?: string | null;
          id?: string;
          liens?: Json | null;
          nom?: string;
          photo?: string | null;
          source_url?: string | null;
          statut_fiche?: string;
          telephone?: string | null;
          type?: string;
          user_id?: string | null;
          verified?: boolean | null;
          verified_at?: string | null;
          verified_by?: string | null;
          ville?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'acteurs_culturels_cree_par_fkey';
            columns: ['cree_par'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'acteurs_culturels_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'acteurs_culturels_verified_by_fkey';
            columns: ['verified_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      annonces: {
        Row: {
          acteur_id: string | null;
          categorie_id: string | null;
          contenu: string | null;
          created_at: string;
          donnees: Json | null;
          format: string | null;
          id: string;
          image: string | null;
          langue: string;
          origine: string;
          published_at: string | null;
          slug: string | null;
          source_url: string | null;
          spotify_url: string | null;
          statut: string;
          titre: string;
          youtube_url: string | null;
        };
        ComputedFields: never;
        Insert: {
          acteur_id?: string | null;
          categorie_id?: string | null;
          contenu?: string | null;
          created_at?: string;
          donnees?: Json | null;
          format?: string | null;
          id: string;
          image?: string | null;
          langue?: string;
          origine?: string;
          published_at?: string | null;
          slug?: string | null;
          source_url?: string | null;
          spotify_url?: string | null;
          statut?: string;
          titre: string;
          youtube_url?: string | null;
        };
        Update: {
          acteur_id?: string | null;
          categorie_id?: string | null;
          contenu?: string | null;
          created_at?: string;
          donnees?: Json | null;
          format?: string | null;
          id?: string;
          image?: string | null;
          langue?: string;
          origine?: string;
          published_at?: string | null;
          slug?: string | null;
          source_url?: string | null;
          spotify_url?: string | null;
          statut?: string;
          titre?: string;
          youtube_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'annonces_acteur_id_fkey';
            columns: ['acteur_id'];
            isOneToOne: false;
            referencedRelation: 'acteurs_culturels';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'annonces_categorie_id_fkey';
            columns: ['categorie_id'];
            isOneToOne: false;
            referencedRelation: 'categories';
            referencedColumns: ['id'];
          },
        ];
      };
      auth_rate_limits: {
        Row: {
          hits: number;
          key: string;
          window_start: string;
        };
        ComputedFields: never;
        Insert: {
          hits?: number;
          key: string;
          window_start?: string;
        };
        Update: {
          hits?: number;
          key?: string;
          window_start?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          nom: string;
        };
        ComputedFields: never;
        Insert: {
          id: string;
          nom: string;
        };
        Update: {
          id?: string;
          nom?: string;
        };
        Relationships: [];
      };
      clicks: {
        Row: {
          annonce_id: string | null;
          cible: string | null;
          created_at: string;
          event_id: string | null;
          id: string;
        };
        ComputedFields: never;
        Insert: {
          annonce_id?: string | null;
          cible?: string | null;
          created_at?: string;
          event_id?: string | null;
          id: string;
        };
        Update: {
          annonce_id?: string | null;
          cible?: string | null;
          created_at?: string;
          event_id?: string | null;
          id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'clicks_annonce_id_fkey';
            columns: ['annonce_id'];
            isOneToOne: false;
            referencedRelation: 'annonces';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'clicks_event_id_fkey';
            columns: ['event_id'];
            isOneToOne: false;
            referencedRelation: 'events';
            referencedColumns: ['id'];
          },
        ];
      };
      demandes_retrait: {
        Row: {
          contact: string | null;
          content_id: string;
          content_type: string | null;
          created_at: string;
          id: string;
          message: string | null;
          statut: string | null;
        };
        ComputedFields: never;
        Insert: {
          contact?: string | null;
          content_id: string;
          content_type?: string | null;
          created_at?: string;
          id: string;
          message?: string | null;
          statut?: string | null;
        };
        Update: {
          contact?: string | null;
          content_id?: string;
          content_type?: string | null;
          created_at?: string;
          id?: string;
          message?: string | null;
          statut?: string | null;
        };
        Relationships: [];
      };
      events: {
        Row: {
          acteur_id: string | null;
          annule: boolean | null;
          categorie_id: string | null;
          commune: string | null;
          contact: string | null;
          created_at: string;
          date_event: string;
          date_fin: string | null;
          description: string | null;
          gratuit: boolean | null;
          id: string;
          image: string | null;
          langue: string;
          lieu: string | null;
          origine: string;
          prix: string | null;
          prix_kz: number | null;
          quartier: string | null;
          slug: string | null;
          source_url: string | null;
          statut: string;
          titre: string;
          ville: string;
        };
        ComputedFields: never;
        Insert: {
          acteur_id?: string | null;
          annule?: boolean | null;
          categorie_id?: string | null;
          commune?: string | null;
          contact?: string | null;
          created_at?: string;
          date_event: string;
          date_fin?: string | null;
          description?: string | null;
          gratuit?: boolean | null;
          id: string;
          image?: string | null;
          langue?: string;
          lieu?: string | null;
          origine?: string;
          prix?: string | null;
          prix_kz?: number | null;
          quartier?: string | null;
          slug?: string | null;
          source_url?: string | null;
          statut?: string;
          titre: string;
          ville: string;
        };
        Update: {
          acteur_id?: string | null;
          annule?: boolean | null;
          categorie_id?: string | null;
          commune?: string | null;
          contact?: string | null;
          created_at?: string;
          date_event?: string;
          date_fin?: string | null;
          description?: string | null;
          gratuit?: boolean | null;
          id?: string;
          image?: string | null;
          langue?: string;
          lieu?: string | null;
          origine?: string;
          prix?: string | null;
          prix_kz?: number | null;
          quartier?: string | null;
          slug?: string | null;
          source_url?: string | null;
          statut?: string;
          titre?: string;
          ville?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'events_acteur_id_fkey';
            columns: ['acteur_id'];
            isOneToOne: false;
            referencedRelation: 'acteurs_culturels';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'events_categorie_id_fkey';
            columns: ['categorie_id'];
            isOneToOne: false;
            referencedRelation: 'categories';
            referencedColumns: ['id'];
          },
        ];
      };
      events_acteurs: {
        Row: {
          acteur_id: string;
          event_id: string;
        };
        ComputedFields: never;
        Insert: {
          acteur_id: string;
          event_id: string;
        };
        Update: {
          acteur_id?: string;
          event_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'events_acteurs_acteur_id_fkey';
            columns: ['acteur_id'];
            isOneToOne: false;
            referencedRelation: 'acteurs_culturels';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'events_acteurs_event_id_fkey';
            columns: ['event_id'];
            isOneToOne: false;
            referencedRelation: 'events';
            referencedColumns: ['id'];
          },
        ];
      };
      favorites: {
        Row: {
          annonce_id: string | null;
          created_at: string;
          event_id: string | null;
          id: string;
          user_id: string | null;
        };
        ComputedFields: never;
        Insert: {
          annonce_id?: string | null;
          created_at?: string;
          event_id?: string | null;
          id: string;
          user_id?: string | null;
        };
        Update: {
          annonce_id?: string | null;
          created_at?: string;
          event_id?: string | null;
          id?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'favorites_annonce_id_fkey';
            columns: ['annonce_id'];
            isOneToOne: false;
            referencedRelation: 'annonces';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'favorites_event_id_fkey';
            columns: ['event_id'];
            isOneToOne: false;
            referencedRelation: 'events';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'favorites_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      likes: {
        Row: {
          annonce_id: string | null;
          created_at: string;
          event_id: string | null;
          id: string;
          user_id: string | null;
        };
        ComputedFields: never;
        Insert: {
          annonce_id?: string | null;
          created_at?: string;
          event_id?: string | null;
          id: string;
          user_id?: string | null;
        };
        Update: {
          annonce_id?: string | null;
          created_at?: string;
          event_id?: string | null;
          id?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'likes_annonce_id_fkey';
            columns: ['annonce_id'];
            isOneToOne: false;
            referencedRelation: 'annonces';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'likes_event_id_fkey';
            columns: ['event_id'];
            isOneToOne: false;
            referencedRelation: 'events';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'likes_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      moderation_log: {
        Row: {
          action: string | null;
          admin_id: string | null;
          content_id: string;
          content_type: string | null;
          created_at: string;
          id: string;
          raison: string | null;
        };
        ComputedFields: never;
        Insert: {
          action?: string | null;
          admin_id?: string | null;
          content_id: string;
          content_type?: string | null;
          created_at?: string;
          id: string;
          raison?: string | null;
        };
        Update: {
          action?: string | null;
          admin_id?: string | null;
          content_id?: string;
          content_type?: string | null;
          created_at?: string;
          id?: string;
          raison?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'moderation_log_admin_id_fkey';
            columns: ['admin_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      revendications_fiches: {
        Row: {
          acteur_id: string | null;
          created_at: string;
          id: string;
          preuve: string | null;
          statut: string | null;
          traite_par: string | null;
          user_id: string | null;
        };
        ComputedFields: never;
        Insert: {
          acteur_id?: string | null;
          created_at?: string;
          id: string;
          preuve?: string | null;
          statut?: string | null;
          traite_par?: string | null;
          user_id?: string | null;
        };
        Update: {
          acteur_id?: string | null;
          created_at?: string;
          id?: string;
          preuve?: string | null;
          statut?: string | null;
          traite_par?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'revendications_fiches_acteur_id_fkey';
            columns: ['acteur_id'];
            isOneToOne: false;
            referencedRelation: 'acteurs_culturels';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'revendications_fiches_traite_par_fkey';
            columns: ['traite_par'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'revendications_fiches_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      shares: {
        Row: {
          annonce_id: string | null;
          canal: string | null;
          created_at: string;
          event_id: string | null;
          id: string;
          user_id: string | null;
        };
        ComputedFields: never;
        Insert: {
          annonce_id?: string | null;
          canal?: string | null;
          created_at?: string;
          event_id?: string | null;
          id: string;
          user_id?: string | null;
        };
        Update: {
          annonce_id?: string | null;
          canal?: string | null;
          created_at?: string;
          event_id?: string | null;
          id?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'shares_annonce_id_fkey';
            columns: ['annonce_id'];
            isOneToOne: false;
            referencedRelation: 'annonces';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'shares_event_id_fkey';
            columns: ['event_id'];
            isOneToOne: false;
            referencedRelation: 'events';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'shares_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      signalements: {
        Row: {
          annonce_id: string | null;
          created_at: string;
          event_id: string | null;
          id: string;
          motif: string;
          statut: string;
          user_id: string | null;
        };
        ComputedFields: never;
        Insert: {
          annonce_id?: string | null;
          created_at?: string;
          event_id?: string | null;
          id: string;
          motif: string;
          statut?: string;
          user_id?: string | null;
        };
        Update: {
          annonce_id?: string | null;
          created_at?: string;
          event_id?: string | null;
          id?: string;
          motif?: string;
          statut?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'signalements_annonce_id_fkey';
            columns: ['annonce_id'];
            isOneToOne: false;
            referencedRelation: 'annonces';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'signalements_event_id_fkey';
            columns: ['event_id'];
            isOneToOne: false;
            referencedRelation: 'events';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'signalements_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      users: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          langue_preferee: string;
          nom: string;
          photo: string | null;
          role: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          email: string;
          id: string;
          langue_preferee?: string;
          nom: string;
          photo?: string | null;
          role?: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          langue_preferee?: string;
          nom?: string;
          photo?: string | null;
          role?: string;
        };
        Relationships: [];
      };
      views: {
        Row: {
          annonce_id: string | null;
          event_id: string | null;
          id: string;
          session_id: string | null;
          user_id: string | null;
          viewed_at: string;
        };
        ComputedFields: never;
        Insert: {
          annonce_id?: string | null;
          event_id?: string | null;
          id: string;
          session_id?: string | null;
          user_id?: string | null;
          viewed_at?: string;
        };
        Update: {
          annonce_id?: string | null;
          event_id?: string | null;
          id?: string;
          session_id?: string | null;
          user_id?: string | null;
          viewed_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'views_annonce_id_fkey';
            columns: ['annonce_id'];
            isOneToOne: false;
            referencedRelation: 'annonces';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'views_event_id_fkey';
            columns: ['event_id'];
            isOneToOne: false;
            referencedRelation: 'events';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'views_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      villes_suivies: {
        Row: {
          created_at: string;
          id: string;
          user_id: string | null;
          ville: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          id: string;
          user_id?: string | null;
          ville: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          user_id?: string | null;
          ville?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'villes_suivies_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      vues_quotidiennes: {
        Row: {
          annonce_id: string | null;
          event_id: string | null;
          jour: string;
          total: number;
        };
        ComputedFields: never;
        Insert: {
          annonce_id?: string | null;
          event_id?: string | null;
          jour: string;
          total: number;
        };
        Update: {
          annonce_id?: string | null;
          event_id?: string | null;
          jour?: string;
          total?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'vues_quotidiennes_annonce_id_fkey';
            columns: ['annonce_id'];
            isOneToOne: false;
            referencedRelation: 'annonces';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'vues_quotidiennes_event_id_fkey';
            columns: ['event_id'];
            isOneToOne: false;
            referencedRelation: 'events';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      cultura_auth_rate_limit: {
        Args: { p_key: string; p_max: number; p_window_seconds: number };
        Returns: boolean;
      };
      cultura_is_acteur: { Args: { uid?: string }; Returns: boolean };
      cultura_is_admin: { Args: { uid?: string }; Returns: boolean };
      cultura_is_editor: { Args: { uid?: string }; Returns: boolean };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema['CompositeTypes'] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
