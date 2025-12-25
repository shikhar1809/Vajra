'use client'

import { useEffect, useState } from 'react'
import { useWorkspace } from '@/contexts/WorkspaceContext'
import { getSupabaseClient } from '@/lib/supabase/client'
import { Search, Plus, Filter, Download, Database, RotateCcw, Radar, FileText } from 'lucide-react'
import VendorScoreCard from '@/components/scout/VendorScoreCard'
import AddVendorForm from '@/components/workspace/scout/AddVendorForm'
import UploadBillForm from '@/components/workspace/scout/UploadBillForm'
import ExportButton from '@/components/shared/ExportButton'
import DomainScanner from '@/components/scout/DomainScanner'

export default function ScoutPage() {
    const { workspace } = useWorkspace()
    const supabase = getSupabaseClient()
    const [vendors, setVendors] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [showAddForm, setShowAddForm] = useState(false)
    const [showAnalyzeModal, setShowAnalyzeModal] = useState(false) // New state
    const [searchQuery, setSearchQuery] = useState('')
    const [filterRisk, setFilterRisk] = useState<string>('all')
    const [isDemoMode, setIsDemoMode] = useState(false)

    useEffect(() => {
        if (workspace) {
            loadVendors()
        }
    }, [workspace])

    async function loadVendors() {
        if (!workspace || isDemoMode) return
        try {
            setIsLoading(true)
            const { data, error } = await supabase
                .from('vendors')
                .select('*')
                .eq('workspace_id', workspace.id)
                .order('security_score', { ascending: false })
            if (error) throw error
            setVendors(data || [])
        } catch (error) {
            console.error('Error loading vendors:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const toggleDemoMode = () => {
        if (!isDemoMode) {
            setIsDemoMode(true)
            setVendors([
                { id: '1', name: 'SecureCloud Inc.', domain: 'securecloud.io', risk_level: 'low', security_score: 95, breach_count: 0 },
                { id: '2', name: 'Legacy Systems Ltd.', domain: 'legacysys.net', risk_level: 'critical', security_score: 45, breach_count: 3 },
                { id: '3', name: 'PaymentGateway X', domain: 'pg-x.com', risk_level: 'medium', security_score: 72, breach_count: 1 },
                { id: '4', name: 'Marketing Tool', domain: 'market-tool.com', risk_level: 'high', security_score: 58, breach_count: 2 },
            ])
        } else {
            setIsDemoMode(false)
            loadVendors()
        }
    }

    const filteredVendors = vendors.filter(vendor => {
        const matchesSearch = vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            vendor.domain.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesFilter = filterRisk === 'all' || vendor.risk_level === filterRisk
        return matchesSearch && matchesFilter
    })

    const stats = {
        total: vendors.length,
        critical: vendors.filter(v => v.risk_level === 'critical').length,
        high: vendors.filter(v => v.risk_level === 'high').length,
        breaches: vendors.reduce((sum, v) => sum + (v.breach_count || 0), 0),
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
                        <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <Radar className="w-7 h-7 text-blue-500" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-1">Scout</h1>
                            <p className="text-slate-400">Vendor Security Monitoring</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {workspace && <ExportButton module="scout" workspaceId={workspace.id} />}

                        {/* New Analyze Button */}
                        <button
                            onClick={() => setShowAnalyzeModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/50 rounded-lg font-semibold transition-colors"
                        >
                            <FileText className="w-5 h-5" />
                            Analyze Invoice
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
                                    <Database className="w-5 h-5 text-blue-400" />
                                    Load Demo
                                </>
                            )}
                        </button>
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Add Vendor
                        </button>
                    </div>
                </div>

                {/* Domain Scanner */}
                <DomainScanner />

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-slate-900/20 backdrop-blur-md border border-slate-800 rounded-lg p-6">
                        <div className="text-sm text-slate-400 mb-1">Total Vendors</div>
                        <div className="text-3xl font-bold text-blue-400">{stats.total}</div>
                    </div>
                    <div className="bg-slate-900/20 backdrop-blur-md border border-slate-800 rounded-lg p-6">
                        <div className="text-sm text-slate-400 mb-1">Critical Risk</div>
                        <div className="text-3xl font-bold text-red-400">{stats.critical}</div>
                    </div>
                    <div className="bg-slate-900/20 backdrop-blur-md border border-slate-800 rounded-lg p-6">
                        <div className="text-sm text-slate-400 mb-1">High Risk</div>
                        <div className="text-3xl font-bold text-orange-400">{stats.high}</div>
                    </div>
                    <div className="bg-slate-900/20 backdrop-blur-md border border-slate-800 rounded-lg p-6">
                        <div className="text-sm text-slate-400 mb-1">Total Breaches</div>
                        <div className="text-3xl font-bold text-yellow-400">{stats.breaches}</div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="flex items-center gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search vendors..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-900/20 backdrop-blur-md border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <select
                        value={filterRisk}
                        onChange={(e) => setFilterRisk(e.target.value)}
                        className="px-4 py-2 bg-slate-900/20 backdrop-blur-md border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                        <option value="all">All Risk Levels</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                    </select>
                </div>

                {/* Vendors Grid */}
                {isLoading ? (
                    <div className="text-center py-12 text-slate-400">Loading vendors...</div>
                ) : filteredVendors.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-blue-500" />
                        </div>
                        <p className="text-slate-400 mb-4">
                            {searchQuery || filterRisk !== 'all' ? 'No vendors match your filters' : 'No vendors added yet'}
                        </p>
                        {!searchQuery && filterRisk === 'all' && (
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                            >
                                Add Your First Vendor
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredVendors.map((vendor) => (
                            <VendorScoreCard key={vendor.id} vendor={vendor} />
                        ))}
                    </div>
                )}

                {/* Add Vendor Modal */}
                {showAddForm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-white">Add Vendor</h2>
                                <button
                                    onClick={() => setShowAddForm(false)}
                                    className="text-slate-400 hover:text-white"
                                >
                                    ✕
                                </button>
                            </div>
                            <AddVendorForm
                                workspaceId={workspace.id}
                                onVendorAdded={() => {
                                    setShowAddForm(false)
                                    loadVendors()
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Analyze Invoice Modal */}
                {showAnalyzeModal && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                        <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto relative">
                            <button
                                onClick={() => setShowAnalyzeModal(false)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-white"
                            >
                                ✕
                            </button>
                            <UploadBillForm />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
