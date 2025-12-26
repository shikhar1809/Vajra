import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Use 'as any' to bypass strict type checking during build when vars might be missing
export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createBrowserClient(supabaseUrl, supabaseAnonKey)
    : ({} as any);

export function getSupabaseClient() {
    if (!supabaseUrl || !supabaseAnonKey) return ({} as any);
    return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// Type-safe database types will be generated from Supabase
export type Database = {
    public: {
        Tables: {
            // Add your table types here
            traffic_logs: any
            anomaly_events: any
            vendors: any
            code_scans: any
            // ... more tables
        }
    }
}
