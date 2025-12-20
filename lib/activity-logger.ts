import { getSupabaseClient } from '@/lib/supabase/client'
import type { ActivityLog } from '@/types/modules'

interface LogActivityParams {
    workspaceId: string
    action: string
    resourceType: string
    resourceId?: string
    description: string
    metadata?: Record<string, any>
}

export async function logActivity(params: LogActivityParams) {
    const supabase = getSupabaseClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { error } = await supabase.from('activity_logs').insert({
            workspace_id: params.workspaceId,
            user_id: user.id,
            action: params.action,
            resource_type: params.resourceType,
            resource_id: params.resourceId,
            description: params.description,
            metadata: params.metadata,
        })

        if (error) throw error
    } catch (error) {
        console.error('Error logging activity:', error)
    }
}

export async function getActivityLogs(workspaceId: string, limit = 50) {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false })
        .limit(limit)

    if (error) throw error
    return data as ActivityLog[]
}
