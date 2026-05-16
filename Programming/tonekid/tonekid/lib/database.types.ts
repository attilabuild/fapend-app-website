export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.5';
  };
  public: {
    Tables: {
      community_tones: {
        Row: {
          artist: string;
          artwork_dominant_color: string | null;
          artwork_url: string | null;
          created_at: string;
          genres: string[];
          id: string;
          likes: number;
          part_type: string;
          placeholder_shade: string | null;
          song: string;
          tone_type: string;
        };
        Insert: {
          artist: string;
          artwork_dominant_color?: string | null;
          artwork_url?: string | null;
          created_at?: string;
          genres?: string[];
          id: string;
          likes?: number;
          part_type: string;
          placeholder_shade?: string | null;
          song: string;
          tone_type: string;
        };
        Update: {
          artist?: string;
          artwork_dominant_color?: string | null;
          artwork_url?: string | null;
          created_at?: string;
          genres?: string[];
          id?: string;
          likes?: number;
          part_type?: string;
          placeholder_shade?: string | null;
          song?: string;
          tone_type?: string;
        };
        Relationships: [];
      };
      community_tone_likes: {
        Row: {
          created_at: string;
          tone_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          tone_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          tone_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'community_tone_likes_tone_id_fkey';
            columns: ['tone_id'];
            isOneToOne: false;
            referencedRelation: 'community_tones';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'community_tone_likes_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      gear: {
        Row: {
          brand: string;
          created_at: string;
          id: string;
          model: string;
          type: string;
          user_id: string;
        };
        Insert: {
          brand: string;
          created_at?: string;
          id?: string;
          model: string;
          type: string;
          user_id: string;
        };
        Update: {
          brand?: string;
          created_at?: string;
          id?: string;
          model?: string;
          type?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'gear_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          active_guitar_id: string | null;
          active_rig_id: string | null;
          adapts_left: number;
          created_at: string;
          email: string | null;
          genres: string[];
          id: string;
          instrument_type: string | null;
          member_since: string;
          name: string | null;
          notifications_enabled: boolean;
          onboarding_completed: boolean;
          recent_song_ids: string[];
          recent_searches: Json;
          skill_level: string | null;
          tier: string;
          tone_heroes: string[];
          updated_at: string;
        };
        Insert: {
          active_guitar_id?: string | null;
          active_rig_id?: string | null;
          adapts_left?: number;
          created_at?: string;
          email?: string | null;
          genres?: string[];
          id: string;
          instrument_type?: string | null;
          member_since?: string;
          name?: string | null;
          notifications_enabled?: boolean;
          onboarding_completed?: boolean;
          recent_song_ids?: string[];
          recent_searches?: Json;
          skill_level?: string | null;
          tier?: string;
          tone_heroes?: string[];
          updated_at?: string;
        };
        Update: {
          active_guitar_id?: string | null;
          active_rig_id?: string | null;
          adapts_left?: number;
          created_at?: string;
          email?: string | null;
          genres?: string[];
          id?: string;
          instrument_type?: string | null;
          member_since?: string;
          name?: string | null;
          notifications_enabled?: boolean;
          onboarding_completed?: boolean;
          recent_song_ids?: string[];
          recent_searches?: Json;
          skill_level?: string | null;
          tier?: string;
          tone_heroes?: string[];
          updated_at?: string;
        };
        Relationships: [];
      };
      song_details: {
        Row: {
          artist: string;
          created_at: string;
          detail: Json;
          id: string;
          song: string;
        };
        Insert: {
          artist: string;
          created_at?: string;
          detail: Json;
          id: string;
          song: string;
        };
        Update: {
          artist?: string;
          created_at?: string;
          detail?: Json;
          id?: string;
          song?: string;
        };
        Relationships: [];
      };
      adapted_tones: {
        Row: {
          fingerprint: string;
          song_id: string;
          part_type: string;
          user_guitar: string;
          user_amp: string | null;
          user_multifx: string | null;
          tone_detail: Json;
          created_at: string;
        };
        Insert: {
          fingerprint: string;
          song_id: string;
          part_type: string;
          user_guitar: string;
          user_amp?: string | null;
          user_multifx?: string | null;
          tone_detail: Json;
          created_at?: string;
        };
        Update: {
          fingerprint?: string;
          song_id?: string;
          part_type?: string;
          user_guitar?: string;
          user_amp?: string | null;
          user_multifx?: string | null;
          tone_detail?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      saved_tones: {
        Row: {
          artist: string;
          created_at: string;
          favorited: boolean;
          gear_summary: string;
          id: string;
          part_type: string;
          song: string;
          tone_detail: Json | null;
          user_id: string;
        };
        Insert: {
          artist: string;
          created_at?: string;
          favorited?: boolean;
          gear_summary?: string;
          id: string;
          part_type: string;
          song: string;
          tone_detail?: Json | null;
          user_id: string;
        };
        Update: {
          artist?: string;
          created_at?: string;
          favorited?: boolean;
          gear_summary?: string;
          id?: string;
          part_type?: string;
          song?: string;
          tone_detail?: Json | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'saved_tones_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
