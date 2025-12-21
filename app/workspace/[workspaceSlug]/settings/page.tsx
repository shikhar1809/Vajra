'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'
import type { Workspace } from '@/types/workspace'

export default function SettingsPage() {
    const params = useParams()
    const router = useRouter()
    const supabase = getSupabaseClient()
    const [workspace, setWorkspace] = useState<Workspace | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const workspaceSlug = params?.workspaceSlug as string

    useEffect(() => {
        loadWorkspace()
    }, [workspaceSlug])

    async function loadWorkspace() {
        try {
            const { data, error } = await supabase
                .from('workspaces')
                .select('*')
                .eq('slug', workspaceSlug)
                .single()

            if (error) throw error
            setWorkspace(data)
        } catch (error) {
            console.error('Error loading workspace:', error)
        } finally {
            setIsLoading(false)
        }
    }

    async function handleSave() {
        if (!workspace) return

        try {
            setIsSaving(true)
            const { error } = await supabase
                .from('workspaces')
                .update({
                    name: workspace.name,
                    business_type: workspace.business_type,
                    company_size: workspace.company_size,
                    country: workspace.country,
                    website: workspace.website,
                })
                .eq('id', workspace.id)

            if (error) throw error
            alert('Settings saved successfully!')
        } catch (error: any) {
            console.error('Error saving settings:', error)
            alert(error.message || 'Failed to save settings')
        } finally {
            setIsSaving(false)
        }
    }

    async function handleDeleteWorkspace() {
        if (!workspace) return

        const confirmed = window.confirm(
            `Are you sure you want to delete "${workspace.name}"?\n\nThis will permanently delete:\n- All vendors, employees, and projects\n- All traffic logs and security data\n- All API keys\n- All workspace settings\n\nThis action cannot be undone!`
        )

        if (!confirmed) return

        const doubleConfirm = window.confirm(
            'This is your last chance. Type DELETE in the next prompt to confirm.'
        )

        if (!doubleConfirm) return

        const userInput = prompt('Type DELETE to confirm deletion:')
        if (userInput !== 'DELETE') {
            alert('Deletion cancelled. Text did not match.')
            return
        }

        try {
            setIsDeleting(true)

            // Delete workspace (cascade should handle related data)
            const { error } = await supabase
                .from('workspaces')
                .delete()
                .eq('id', workspace.id)

            if (error) throw error

            alert('Workspace deleted successfully')
            router.push('/workspace')
        } catch (error: any) {
            console.error('Error deleting workspace:', error)
            alert(error.message || 'Failed to delete workspace')
        } finally {
            setIsDeleting(false)
        }
    }

    if (isLoading || !workspace) {
        return (
            <div className="p-8">
                <div className="text-white text-xl">Loading settings...</div>
            </div>
        )
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">⚙️ Workspace Settings</h1>
                <p className="text-slate-400">Manage your workspace configuration</p>
            </div>

            {/* Settings Form */}
            <div className="max-w-2xl">
                <div className="bg-slate-900/20 backdrop-blur-md border border-slate-800/50 rounded-lg p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-white mb-2">
                            Workspace Name
                        </label>
                        <input
                            type="text"
                            value={workspace.name}
                            onChange={(e) => setWorkspace({ ...workspace, name: e.target.value })}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white mb-2">
                            Workspace URL
                        </label>
                        <div className="flex items-center gap-2">
                            <span className="text-slate-400">vajra.app/workspace/</span>
                            <input
                                type="text"
                                value={workspace.slug}
                                disabled
                                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-500 cursor-not-allowed"
                            />
                        </div>
                        <p className="text-sm text-slate-500 mt-1">URL cannot be changed</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white mb-2">
                            Business Type
                        </label>
                        <select
                            value={workspace.business_type}
                            onChange={(e) => setWorkspace({ ...workspace, business_type: e.target.value })}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                        >
                            <option value="finance">Finance & Banking</option>
                            <option value="healthcare">Healthcare</option>
                            <option value="retail">Retail & E-commerce</option>
                            <option value="tech">Technology</option>
                            <option value="education">Education</option>
                            <option value="government">Government</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white mb-2">
                            Company Size
                        </label>
                        <select
                            value={workspace.company_size || ''}
                            onChange={(e) => setWorkspace({ ...workspace, company_size: e.target.value })}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                        >
                            <option value="solo">Just me</option>
                            <option value="2-10">2-10 employees</option>
                            <option value="11-50">11-50 employees</option>
                            <option value="51-200">51-200 employees</option>
                            <option value="201-500">201-500 employees</option>
                            <option value="500+">500+ employees</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white mb-2">
                            Country
                        </label>
                        <input
                            type="text"
                            value={workspace.country || ''}
                            onChange={(e) => setWorkspace({ ...workspace, country: e.target.value })}
                            placeholder="United States"
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white mb-2">
                            Website
                        </label>
                        <input
                            type="url"
                            value={workspace.website || ''}
                            onChange={(e) => setWorkspace({ ...workspace, website: e.target.value })}
                            placeholder="https://example.com"
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                        />
                    </div>

                    <div className="pt-4 border-t border-slate-800">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="mt-8 bg-red-900/20 border border-red-500/30 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-red-500 mb-2">Danger Zone</h3>
                    <p className="text-slate-400 mb-4">
                        Deleting your workspace is permanent and cannot be undone. All data will be lost.
                    </p>
                    <button
                        onClick={handleDeleteWorkspace}
                        disabled={isDeleting}
                        className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isDeleting ? 'Deleting...' : 'Delete Workspace'}
                    </button>
                </div>
            </div>
        </div>
    )
}
