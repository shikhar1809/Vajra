import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export function getSupabaseClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
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
