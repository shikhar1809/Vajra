import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// if (!supabaseUrl || !supabaseServiceKey) {
//     throw new Error('Missing Supabase server environment variables');
// }

// Server-side client with service role key (bypasses RLS)
// Hack: During build time, these might be empty. Return a dummy or null to prevent crash.
// The actual runtime check will happen when used.
const isBuildTime = process.env.NODE_ENV === 'production' && !supabaseUrl;

export const supabaseAdmin = (supabaseUrl && supabaseServiceKey)
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    })
    : ({} as any); // Mock for build time to prevent "supabaseUrl is required" error

if (!isBuildTime && (!supabaseUrl || !supabaseServiceKey)) {
    console.warn('Missing Supabase server environment variables');
}
