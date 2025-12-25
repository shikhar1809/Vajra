import { createBrowserClient } from '@supabase/ssr'

function getSupabaseClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
}

// ============================================
// OAuth Authentication
// ============================================

export async function signInWithGoogle() {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${window.location.origin}/auth/callback`,
            queryParams: {
                access_type: 'offline',
                prompt: 'consent',
            },
        },
    })

    return { data, error }
}

// ============================================
// Email/Password Authentication
// ============================================

export async function signUpWithEmail(email: string, password: string, fullName?: string) {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
    })

    return { data, error }
}

export async function signInWithEmail(email: string, password: string) {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    return { data, error }
}

export async function resetPassword(email: string) {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    return { data, error }
}

export async function updatePassword(newPassword: string) {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
    })

    return { data, error }
}

// ============================================
// Session Management
// ============================================

export async function signOut() {
    const supabase = getSupabaseClient()
    const { error } = await supabase.auth.signOut()
    return { error }
}

export async function getCurrentUser() {
    const supabase = getSupabaseClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
}

export async function getSession() {
    const supabase = getSupabaseClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
}

export async function isAuthenticated(): Promise<boolean> {
    const { session } = await getSession()
    return !!session
}

// ============================================
// User Profile
// ============================================

export async function updateUserProfile(updates: {
    full_name?: string
    avatar_url?: string
}) {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase.auth.updateUser({
        data: updates,
    })

    return { data, error }
}
