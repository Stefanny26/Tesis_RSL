import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wdneesawdikizuzkmapr.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkbmVlc2F3ZGlraXp1emttYXByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2MTAzMTMsImV4cCI6MjA3NzE4NjMxM30.3KfkzRNqVfkwAyeoEIraWwU0rH74c1yM1jgTD2W7OG4'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Tipos de datos para TypeScript
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          fullName: string
          passwordHash?: string
          avatarUrl?: string
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          email: string
          fullName: string
          passwordHash?: string
          avatarUrl?: string
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          email?: string
          fullName?: string
          passwordHash?: string
          avatarUrl?: string
          createdAt?: string
          updatedAt?: string
        }
      }
      projects: {
        Row: {
          id: string
          title: string
          description: string
          status: string
          createdAt: string
          updatedAt: string
          ownerId: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          status?: string
          createdAt?: string
          updatedAt?: string
          ownerId: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          status?: string
          createdAt?: string
          updatedAt?: string
          ownerId?: string
        }
      }
    }
  }
}