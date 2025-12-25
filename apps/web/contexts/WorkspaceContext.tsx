'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'
import type { Workspace } from '@/types/workspace'

interface WorkspaceContextType {
    workspace: Workspace | null
    workspaces: Workspace[]
    isLoading: boolean
    switchWorkspace: (slug: string) => void
    refreshWorkspace: () => Promise<void>
    refreshWorkspaces: () => Promise<void>
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined)

export function WorkspaceProvider({
    children,
    initialWorkspace
}: {
    children: ReactNode
    initialWorkspace?: Workspace | null
}) {
    const [workspace, setWorkspace] = useState<Workspace | null>(initialWorkspace || null)
    const [workspaces, setWorkspaces] = useState<Workspace[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()
    const supabase = getSupabaseClient()

    useEffect(() => {
        loadWorkspaces()
    }, [])

    async function loadWorkspaces() {
        try {
            setIsLoading(true)
            const { data, error } = await supabase
                .from('workspaces')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            if (data) setWorkspaces(data)
        } catch (error) {
            console.error('Error loading workspaces:', error)
        } finally {
            setIsLoading(false)
        }
    }

    function switchWorkspace(slug: string) {
        router.push(`/workspace/${slug}/dashboard`)
    }

    async function refreshWorkspace() {
        if (!workspace) return

        try {
            const { data, error } = await supabase
                .from('workspaces')
                .select('*')
                .eq('id', workspace.id)
                .single()

            if (error) throw error
            if (data) setWorkspace(data)
        } catch (error) {
            console.error('Error refreshing workspace:', error)
        }
    }

    async function refreshWorkspaces() {
        await loadWorkspaces()
    }

    return (
        <WorkspaceContext.Provider value={{
            workspace,
            workspaces,
            isLoading,
            switchWorkspace,
            refreshWorkspace,
            refreshWorkspaces
        }}>
            {children}
        </WorkspaceContext.Provider>
    )
}

export function useWorkspace() {
    const context = useContext(WorkspaceContext)
    if (!context) {
        throw new Error('useWorkspace must be used within WorkspaceProvider')
    }
    return context
}
