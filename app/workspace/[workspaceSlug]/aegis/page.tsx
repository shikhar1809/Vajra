'use client'

import { useEffect, useState } from 'react'
import { useWorkspace } from '@/contexts/WorkspaceContext'
import { getSupabaseClient } from '@/lib/supabase/client'
import { Search, Plus, Code, Shield, RotateCcw, Database, FileScan, Terminal } from 'lucide-react'
import ProjectScoreCard from '@/components/aegis/ProjectScoreCard'
import AddProjectForm from '@/components/workspace/aegis/AddProjectForm'
import ExportButton from '@/components/shared/ExportButton'
import CodeScanner from '@/components/aegis/CodeScanner'
import IntegrationGuide from '@/components/shared/IntegrationGuide'

export default function AegisPage() {
    const { workspace } = useWorkspace()
    const supabase = getSupabaseClient()
    const [projects, setProjects] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [showAddForm, setShowAddForm] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [isDemoMode, setIsDemoMode] = useState(false)
    const [showIntegration, setShowIntegration] = useState(false)

    useEffect(() => {
        if (workspace) {
            loadProjects()
        }
    }, [workspace])

    async function loadProjects() {
        if (!workspace || isDemoMode) return

        try {
            setIsLoading(true)
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('workspace_id', workspace.id)
                .order('security_score', { ascending: false })

            if (error) throw error
            setProjects(data || [])
        } catch (error) {
            console.error('Error loading projects:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const toggleDemoMode = () => {
        if (!isDemoMode) {
            setIsDemoMode(true)
            setProjects([
                { id: '1', name: 'Legacy Backend', repository_url: 'github.com/org/legacy', security_score: 45, vulnerabilities_critical: 3, vulnerabilities_high: 8, vulnerabilities_medium: 12 },
                { id: '2', name: 'Frontend App', repository_url: 'github.com/org/frontend', security_score: 88, vulnerabilities_critical: 0, vulnerabilities_high: 1, vulnerabilities_medium: 4 },
                { id: '3', name: 'Auth Service', repository_url: 'github.com/org/auth', security_score: 92, vulnerabilities_critical: 0, vulnerabilities_high: 0, vulnerabilities_medium: 2 },
                { id: '4', name: 'Payment API', repository_url: 'github.com/org/payments', security_score: 65, vulnerabilities_critical: 1, vulnerabilities_high: 4, vulnerabilities_medium: 8 },
            ])
        } else {
            setIsDemoMode(false)
            loadProjects()
        }
    }

    const filteredProjects = projects.filter(proj =>
        proj.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (proj.repository_url && proj.repository_url.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    const stats = {
        total: projects.length,
        critical: projects.filter(p => (p.vulnerabilities_critical || 0) > 0).length,
        secure: projects.filter(p => p.security_score >= 80).length,
        totalVulns: projects.reduce((sum, p) =>
            sum + (p.vulnerabilities_critical || 0) +
            (p.vulnerabilities_high || 0) +
            (p.vulnerabilities_medium || 0) +
            (p.vulnerabilities_low || 0), 0
        ),
    }

    if (!workspace) {
        return <div className="text-white">Loading...</div>
    }

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                            <FileScan className="w-7 h-7 text-green-500" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-1">Aegis</h1>
                            <p className="text-slate-400">Code Security Scanning</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {workspace && <ExportButton module="aegis" workspaceId={workspace.id} />}
                        <button
                            onClick={() => setShowIntegration(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors shadow-lg shadow-blue-500/20"
                        >
                            <Terminal className="w-4 h-4" />
                            Connect Project
                        </button>
                        <button
                            onClick={toggleDemoMode}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${isDemoMode
                                ? 'bg-amber-500 hover:bg-amber-600 text-black'
                                : 'bg-white/10 hover:bg-white/20 text-white'
                                }`}
                        >
                            {isDemoMode ? (
                                <>
                                    <RotateCcw className="w-5 h-5" />
                                    Clear Demo
                                </>
                            ) : (
                                <>
                                    <Database className="w-5 h-5 text-green-400" />
                                    Load Demo
                                </>
                            )}
                        </button>
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Add Project
                        </button>
                    </div>
                </div>

                {workspace && (
                    <IntegrationGuide
                        isOpen={showIntegration}
                        onClose={() => setShowIntegration(false)}
                        module="aegis"
                        workspaceId={workspace.id}
                    />
                )}

                {/* Code Scanner */}
                <CodeScanner />

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-slate-900/20 backdrop-blur-md border border-slate-800 rounded-lg p-6">
                        <div className="text-sm text-slate-400 mb-1">Total Projects</div>
                        <div className="text-3xl font-bold text-green-400">{stats.total}</div>
                    </div>
                    <div className="bg-slate-900/20 backdrop-blur-md border border-slate-800 rounded-lg p-6">
                        <div className="text-sm text-slate-400 mb-1">Critical Issues</div>
                        <div className="text-3xl font-bold text-red-400">{stats.critical}</div>
                    </div>
                    <div className="bg-slate-900/20 backdrop-blur-md border border-slate-800 rounded-lg p-6">
                        <div className="text-sm text-slate-400 mb-1">Secure Projects</div>
                        <div className="text-3xl font-bold text-green-400">{stats.secure}</div>
                    </div>
                    <div className="bg-slate-900/20 backdrop-blur-md border border-slate-800 rounded-lg p-6">
                        <div className="text-sm text-slate-400 mb-1">Total Vulnerabilities</div>
                        <div className="text-3xl font-bold text-yellow-400">{stats.totalVulns}</div>
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search projects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-900/20 backdrop-blur-md border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-green-500"
                    />
                </div>

                {/* Projects Grid */}
                {isLoading ? (
                    <div className="text-center py-12 text-slate-400">Loading projects...</div>
                ) : filteredProjects.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Code className="w-8 h-8 text-green-500" />
                        </div>
                        <p className="text-slate-400 mb-4">
                            {searchQuery ? 'No projects match your search' : 'No projects added yet'}
                        </p>
                        {!searchQuery && (
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                            >
                                Add Your First Project
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProjects.map((project) => (
                            <ProjectScoreCard key={project.id} project={project} />
                        ))}
                    </div>
                )}

                {/* Add Project Modal */}
                {showAddForm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-white">Add Project</h2>
                                <button
                                    onClick={() => setShowAddForm(false)}
                                    className="text-slate-400 hover:text-white"
                                >
                                    ✕
                                </button>
                            </div>
                            <AddProjectForm
                                workspaceId={workspace.id}
                                onProjectAdded={() => {
                                    setShowAddForm(false)
                                    loadProjects()
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
