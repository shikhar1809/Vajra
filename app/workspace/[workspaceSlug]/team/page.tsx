'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'
import type { WorkspaceMember, UserProfile } from '@/types/workspace'
import { useWorkspace } from '@/contexts/WorkspaceContext'

export default function TeamPage() {
    const params = useParams()
    const supabase = getSupabaseClient()
    const { workspace } = useWorkspace()
    const [members, setMembers] = useState<(WorkspaceMember & { profile?: UserProfile })[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const workspaceSlug = params?.workspaceSlug as string

    useEffect(() => {
        loadMembers()
    }, [workspaceSlug])

    async function loadMembers() {
        try {
            if (!workspace) return

            const { data, error } = await supabase
                .from('workspace_members')
                .select(`
          *,
          profile:user_profiles(*)
        `)
                .eq('workspace_id', workspace.id)
                .order('joined_at', { ascending: false })

            if (error) throw error
            if (data) setMembers(data as any)
        } catch (error) {
            console.error('Error loading members:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'owner':
                return 'bg-red-500 text-white'
            case 'admin':
                return 'bg-orange-500 text-white'
            case 'member':
                return 'bg-blue-500 text-white'
            case 'viewer':
                return 'bg-slate-500 text-white'
            default:
                return 'bg-slate-600 text-white'
        }
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">👥 Team Members</h1>
                    <p className="text-slate-400">Manage your workspace team</p>
                </div>
                <button className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors">
                    + Invite Member
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-slate-900/20 backdrop-blur-md border border-slate-800/50 rounded-lg p-4">
                    <div className="text-sm text-slate-400 mb-1">Total Members</div>
                    <div className="text-2xl font-bold text-white">{members.length}</div>
                </div>
                <div className="bg-slate-900/20 backdrop-blur-md border border-slate-800/50 rounded-lg p-4">
                    <div className="text-sm text-slate-400 mb-1">Active</div>
                    <div className="text-2xl font-bold text-green-500">
                        {members.filter(m => m.status === 'active').length}
                    </div>
                </div>
                <div className="bg-slate-900/20 backdrop-blur-md border border-slate-800/50 rounded-lg p-4">
                    <div className="text-sm text-slate-400 mb-1">Admins</div>
                    <div className="text-2xl font-bold text-orange-500">
                        {members.filter(m => m.role === 'admin' || m.role === 'owner').length}
                    </div>
                </div>
                <div className="bg-slate-900/20 backdrop-blur-md border border-slate-800/50 rounded-lg p-4">
                    <div className="text-sm text-slate-400 mb-1">Invited</div>
                    <div className="text-2xl font-bold text-blue-500">
                        {members.filter(m => m.status === 'invited').length}
                    </div>
                </div>
            </div>

            {/* Members List */}
            <div className="bg-slate-900/20 backdrop-blur-md border border-slate-800/50 rounded-lg overflow-hidden">
                {isLoading ? (
                    <div className="p-8 text-center text-slate-400">Loading team members...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                                        Member
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                                        Joined
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {members.map(member => (
                                    <tr key={member.id} className="hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-semibold">
                                                    {member.profile?.full_name?.[0] || '?'}
                                                </div>
                                                <div>
                                                    <div className="text-white font-medium">
                                                        {member.profile?.full_name || 'Unknown User'}
                                                    </div>
                                                    <div className="text-sm text-slate-400">
                                                        {member.profile?.job_title || 'No title'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadge(member.role)}`}>
                                                {member.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`font-medium ${member.status === 'active' ? 'text-green-500' :
                                                member.status === 'invited' ? 'text-blue-500' :
                                                    'text-slate-400'
                                                }`}>
                                                {member.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-400 text-sm">
                                            {new Date(member.joined_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button className="text-slate-400 hover:text-white transition-colors">
                                                ⋮
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
