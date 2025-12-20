'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'
import { getActivityLogs } from '@/lib/activity-logger'
import type { ActivityLog } from '@/types/modules'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertTriangle, Info, FileText, Shield, DollarSign, Eye, Users } from 'lucide-react'
import { useWorkspace } from '@/contexts/WorkspaceContext'

export default function ActivityPage() {
    const params = useParams()
    const supabase = getSupabaseClient()
    const { workspace } = useWorkspace()
    const [logs, setLogs] = useState<ActivityLog[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const workspaceSlug = params?.workspaceSlug as string

    useEffect(() => {
        loadLogs()

        // Set up real-time subscription for new activity
        const subscription = supabase
            .channel('activity_logs')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'activity_logs'
            }, (payload) => {
                setLogs(prev => [payload.new as ActivityLog, ...prev])
            })
            .subscribe()

        return () => {
            subscription.unsubscribe()
        }
    }, [workspaceSlug])

    async function loadLogs() {
        try {
            if (!workspace) return

            const data = await getActivityLogs(workspace.id, 50)
            setLogs(data)
        } catch (error) {
            console.error('Error loading activity logs:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const getActionIcon = (resourceType: string) => {
        switch (resourceType) {
            case 'threat': return <Shield className="h-4 w-4 text-red-400" />
            case 'document': return <FileText className="h-4 w-4 text-blue-400" />
            case 'transaction': return <DollarSign className="h-4 w-4 text-yellow-400" />
            case 'detection': return <Eye className="h-4 w-4 text-purple-400" />
            case 'member': return <Users className="h-4 w-4 text-green-400" />
            default: return <Info className="h-4 w-4 text-slate-400" />
        }
    }

    const getActionColor = (action: string) => {
        switch (action) {
            case 'created': return 'text-green-400'
            case 'updated': return 'text-blue-400'
            case 'deleted': return 'text-red-400'
            case 'scanned': return 'text-purple-400'
            case 'detected': return 'text-yellow-400'
            default: return 'text-slate-400'
        }
    }

    const logVariants = {
        initial: { opacity: 0, x: -50, scale: 0.8 },
        animate: { opacity: 1, x: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 300, damping: 20 } },
        exit: { opacity: 0, x: 50, transition: { duration: 0.3 } }
    }

    return (
        <div className="relative w-full min-h-screen flex flex-col p-8">
            <div className="relative z-10 flex flex-col mb-8">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8, ease: "easeInOut" }}
                    className="text-5xl md:text-6xl font-bold tracking-tighter mb-4 text-white"
                >
                    Live Activity Feed
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.8, ease: "easeInOut" }}
                    className="text-lg text-slate-400"
                >
                    Real-time workspace activity and system events
                </motion.p>
            </div>

            {/* Activity Stream Container */}
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8, ease: "easeInOut" }}
                className="relative w-full max-w-4xl mx-auto flex-1 bg-black/30 backdrop-blur-md rounded-lg border border-slate-800/50 shadow-2xl shadow-slate-900/50"
            >
                <div className="absolute top-0 left-0 w-full h-12 bg-slate-900/80 rounded-t-lg flex items-center px-4">
                    <div className="flex space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <p className="mx-auto text-slate-400 text-sm">Activity Logs</p>
                </div>

                <div className="h-[600px] pt-12 overflow-y-auto font-mono text-sm text-slate-300 p-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-slate-400">Loading activity...</div>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <Info className="w-16 h-16 text-slate-600 mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">No activity yet</h3>
                            <p className="text-slate-400">Activity will appear here as you use the workspace</p>
                        </div>
                    ) : (
                        <AnimatePresence initial={false}>
                            {logs.map(log => (
                                <motion.div
                                    key={log.id}
                                    layout
                                    variants={logVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                    className="flex items-start gap-4 mb-3 p-3 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors"
                                >
                                    <span className="text-slate-600 text-xs mt-1">
                                        {new Date(log.created_at).toLocaleTimeString()}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        {getActionIcon(log.resource_type)}
                                    </div>
                                    <div className="flex-1">
                                        <div className={`font-bold ${getActionColor(log.action)}`}>
                                            [{log.action.toUpperCase()}]
                                        </div>
                                        <div className="text-slate-300 mt-1">{log.description}</div>
                                        <div className="text-xs text-slate-500 mt-1">
                                            {log.resource_type} • {log.user_id || 'System'}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>
                <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-black/80 to-transparent pointer-events-none rounded-b-lg"></div>
            </motion.div>
        </div>
    )
}
