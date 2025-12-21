import { getSupabaseClient } from './supabase/client'

export interface DemoLockStatus {
    isLocked: boolean
    reason: string
    modulesWithData: string[]
    totalRealEntries: number
}

/**
 * Check if demo mode should be locked due to real data existing in workspace
 */
export async function checkDemoLock(workspaceId: string): Promise<DemoLockStatus> {
    const supabase = getSupabaseClient()
    const modulesWithData: string[] = []
    let totalRealEntries = 0

    try {
        // Check Aegis (Projects)
        const { count: projectCount } = await supabase
            .from('projects')
            .select('*', { count: 'exact', head: true })
            .eq('workspace_id', workspaceId)

        if (projectCount && projectCount > 0) {
            modulesWithData.push('Aegis')
            totalRealEntries += projectCount
        }

        // Check Scout (Vendors)
        const { count: vendorCount } = await supabase
            .from('vendors')
            .select('*', { count: 'exact', head: true })
            .eq('workspace_id', workspaceId)

        if (vendorCount && vendorCount > 0) {
            modulesWithData.push('Scout')
            totalRealEntries += vendorCount
        }

        // Check Sentry (Employees)
        const { count: employeeCount } = await supabase
            .from('employees')
            .select('*', { count: 'exact', head: true })
            .eq('workspace_id', workspaceId)

        if (employeeCount && employeeCount > 0) {
            modulesWithData.push('Sentry')
            totalRealEntries += employeeCount
        }

        const isLocked = modulesWithData.length > 0

        return {
            isLocked,
            reason: isLocked
                ? `Demo mode is locked because you have real data in ${modulesWithData.join(', ')}. Remove all manual entries to use demo mode.`
                : 'Demo mode is available',
            modulesWithData,
            totalRealEntries,
        }
    } catch (error) {
        console.error('Error checking demo lock status:', error)
        return {
            isLocked: false,
            reason: 'Unable to check demo lock status',
            modulesWithData: [],
            totalRealEntries: 0,
        }
    }
}

/**
 * React hook for demo lock status
 */
export function useDemoLock(workspaceId: string | undefined) {
    const [lockStatus, setLockStatus] = React.useState<DemoLockStatus>({
        isLocked: false,
        reason: '',
        modulesWithData: [],
        totalRealEntries: 0,
    })
    const [isChecking, setIsChecking] = React.useState(true)

    React.useEffect(() => {
        if (!workspaceId) {
            setIsChecking(false)
            return
        }

        checkDemoLock(workspaceId).then((status) => {
            setLockStatus(status)
            setIsChecking(false)
        })
    }, [workspaceId])

    return { ...lockStatus, isChecking }
}

// For non-React contexts
import React from 'react'
