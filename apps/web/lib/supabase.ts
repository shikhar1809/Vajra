import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : ({} as any);

// Database types will be generated from Supabase schema
export type Database = {
    public: {
        Tables: {
            // Shield Module
            traffic_logs: {
                Row: {
                    id: string
                    timestamp: string
                    ip_address: string
                    user_agent: string
                    endpoint: string
                    response_time: number
                    status_code: number
                }
                Insert: Omit<Database['public']['Tables']['traffic_logs']['Row'], 'id'>
                Update: Partial<Database['public']['Tables']['traffic_logs']['Insert']>
            }
            // Add more table types as we create the schema
        }
    }
}
