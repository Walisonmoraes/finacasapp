import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and anon key must be defined')
}

console.log('Inicializando Supabase client com:', {
  url: supabaseUrl,
  keyLength: supabaseAnonKey.length
})

export const supabase = createBrowserClient(
  supabaseUrl,
  supabaseAnonKey
)

// Tipos das tabelas
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      transactions: {
        Row: {
          id: string
          created_at: string
          description: string
          amount: number
          date: string
          category_id: string
          type: 'income' | 'expense'
          notes?: string
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          description: string
          amount: number
          date: string
          type: 'income' | 'expense'
          notes?: string | null
          category_id?: string | null
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          description?: string
          amount?: number
          date?: string
          type?: 'income' | 'expense'
          notes?: string | null
          category_id?: string | null
          user_id?: string
        }
      }
      categories: {
        Row: {
          id: string
          created_at: string
          name: string
          type: 'income' | 'expense'
          description?: string
          color: string
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          type: 'income' | 'expense'
          description?: string | null
          color: string
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          type?: 'income' | 'expense'
          description?: string | null
          color?: string
          user_id?: string
        }
      }
      users: {
        Row: {
          id: string
          created_at: string
          email: string
          name?: string
        }
        Insert: {
          id?: string
          created_at?: string
          email: string
          name?: string
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          name?: string
        }
      }
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
