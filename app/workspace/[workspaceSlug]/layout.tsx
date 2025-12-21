'use client'

import { useEffect, useState } from 'react'
import { useParams, usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { getSupabaseClient } from '@/lib/supabase/client'
import { WorkspaceProvider } from '@/contexts/WorkspaceContext'
import { signOut } from '@/lib/auth'
import { LayoutDashboard, ShieldAlert, FileScan, Radar, ScanFace, Users, Activity, Settings, ChevronLeft, ChevronRight, LogOut, Plus, Home, Bell, Search } from 'lucide-react'
import type { Workspace } from '@/types/workspace'
import { Component as CircularCommandMenu } from '@/components/circular-command-menu'

// Dynamic import for GenerativeMountainScene to avoid SSR issues
const MountainScene = dynamic(() => import('@/components/mountain-scene').then(mod => ({ default: mod.GenerativeMountainScene })), {
    ssr: false,
    loading: () => <div className="fixed inset-0 z-0 bg-gradient-to-br from-black via-red-950/20 to-black" />
})

export default function WorkspaceLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const params = useParams()
    const pathname = usePathname()
    const router = useRouter()
    const supabase = getSupabaseClient()
    const [workspace, setWorkspace] = useState<Workspace | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)

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
            router.push('/workspace')
        } finally {
            setIsLoading(false)
        }
    }

    async function handleSignOut() {
        await signOut()
        router.push('/')
    }

    const isActive = (path: string) => pathname?.includes(path)

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', href: `/workspace/${workspaceSlug}/dashboard` },
        { icon: ShieldAlert, label: 'Shield', href: `/workspace/${workspaceSlug}/shield` },
        { icon: FileScan, label: 'Aegis', href: `/workspace/${workspaceSlug}/aegis` },
        { icon: Radar, label: 'Scout', href: `/workspace/${workspaceSlug}/scout` },
        { icon: ScanFace, label: 'Sentry', href: `/workspace/${workspaceSlug}/sentry` },
    ]

    const bottomNavItems = [
        { icon: Users, label: 'Team', href: `/workspace/${workspaceSlug}/team` },
        { icon: Activity, label: 'Activity', href: `/workspace/${workspaceSlug}/activity` },
        { icon: Settings, label: 'Settings', href: `/workspace/${workspaceSlug}/settings` },
    ]

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-white text-xl">Loading workspace...</div>
            </div>
        )
    }

    if (!workspace) {
        return null
    }

    return (
        <WorkspaceProvider initialWorkspace={workspace}>
            {/* Mountain Scene Background */}
            <div className="fixed inset-0 z-0">
                <MountainScene />
            </div>

            <div className="min-h-screen text-white flex relative z-10">
                {/* Sidebar */}
                <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-slate-900/20 backdrop-blur-md border-r border-slate-800/50 flex flex-col transition-all duration-300`}>
                    {/* Workspace Header */}
                    <div className="p-4 border-b border-slate-800/50">
                        {isSidebarOpen ? (
                            <div>
                                <h2 className="font-bold text-lg truncate">{workspace.name}</h2>
                                <p className="text-sm text-slate-400 truncate">{workspace.business_type}</p>
                            </div>
                        ) : (
                            <div className="text-2xl text-center font-bold">{workspace.name[0]}</div>
                        )}
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                        {navItems.map(item => {
                            const Icon = item.icon
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive(item.href)
                                        ? 'bg-red-500 text-white'
                                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    {isSidebarOpen && <span>{item.label}</span>}
                                </Link>
                            )
                        })}

                        <div className="my-4 border-t border-slate-800/50" />

                        {bottomNavItems.map(item => {
                            const Icon = item.icon
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive(item.href)
                                        ? 'bg-red-500 text-white'
                                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    {isSidebarOpen && <span>{item.label}</span>}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Bottom Actions */}
                    <div className="p-4 border-t border-slate-800/50 space-y-2">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800/50 hover:text-white transition-colors"
                        >
                            {isSidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                            {isSidebarOpen && <span>Collapse</span>}
                        </button>
                        <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800/50 hover:text-red-400 transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            {isSidebarOpen && <span>Sign Out</span>}
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>


            </div>
        </WorkspaceProvider>
    )
}
