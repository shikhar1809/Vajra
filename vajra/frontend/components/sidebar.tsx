'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Shield, Users, FileText, LayoutDashboard } from 'lucide-react'

const navItems = [
    { name: 'Command Center', href: '/command-center', icon: LayoutDashboard },
    { name: 'Vendor Risk', href: '/vendor-risk', icon: Shield },
    { name: 'Employee Security', href: '/employee-security', icon: Users },
    { name: 'Compliance', href: '/compliance', icon: FileText },
]

export default function Sidebar() {
    const pathname = usePathname()

    return (
        <div className="w-64 bg-slate-900 h-screen fixed left-0 top-0 border-r border-slate-800">
            <div className="p-6">
                <h1 className="text-2xl font-bold text-white">VAJRA</h1>
                <p className="text-xs text-red-500 mt-1">Security Platform</p>
            </div>

            <nav className="mt-6">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-6 py-3 transition-colors ${isActive
                                ? 'bg-red-500/10 text-red-500 border-r-2 border-red-500'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <Icon size={20} />
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}
