// Mirrors the public schema of the shared Supabase project so that the admin
// panel in the original portfolio keeps feeding this site.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      projects: {
        Row: {
          created_at: string
          description: string
          github_url: string | null
          id: string
          image_url: string | null
          is_contribution: boolean
          live_url: string | null
          sort_order: number
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['projects']['Row']> & {
          description: string
          title: string
        }
        Update: Partial<Database['public']['Tables']['projects']['Row']>
        Relationships: []
      }
      site_content: {
        Row: {
          content: Json
          section: string
          updated_at: string
        }
        Insert: { content?: Json; section: string; updated_at?: string }
        Update: { content?: Json; section?: string; updated_at?: string }
        Relationships: []
      }
      skills: {
        Row: {
          category: string
          created_at: string
          icon: string
          id: string
          name: string
          percentage: number
          sort_order: number
        }
        Insert: Partial<Database['public']['Tables']['skills']['Row']> & {
          category: string
          name: string
        }
        Update: Partial<Database['public']['Tables']['skills']['Row']>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
