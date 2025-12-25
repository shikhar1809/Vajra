export interface Workspace {
    id: string
    name: string
    slug: string
    owner_id: string
    business_type: string
    industry?: string
    company_size?: string
    country?: string
    website?: string
    settings: Record<string, any>
    created_at: string
    updated_at: string
}

export interface WorkspaceMember {
    id: string
    workspace_id: string
    user_id: string
    role: 'owner' | 'admin' | 'member' | 'viewer'
    permissions: Record<string, any>
    status: 'active' | 'invited' | 'suspended'
    invited_by?: string
    invited_at?: string
    joined_at: string
    created_at: string
    updated_at: string
}

export interface UserProfile {
    id: string
    full_name?: string
    avatar_url?: string
    job_title?: string
    department?: string
    preferences: Record<string, any>
    created_at: string
    updated_at: string
}
