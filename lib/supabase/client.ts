import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
    },
    realtime: {
        params: {
            eventsPerSecond: 10,
        },
    },
});

// Type-safe database types will be generated from Supabase
export type Database = {
    public: {
        Tables: {
            // Add your table types here
            traffic_logs: any;
            anomaly_events: any;
            vendors: any;
            code_scans: any;
            // ... more tables
        };
    };
};
