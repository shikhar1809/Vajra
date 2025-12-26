"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShieldAlert, Users, FileText, Lock, BrainCircuit } from "lucide-react";
import clsx from "clsx";

const navItems = [
    { label: "Command Center", href: "/command-center", icon: LayoutDashboard },
    { label: "Vendor Risk", href: "/vendor-risk", icon: ShieldAlert },
    { label: "Employee Security", href: "/employee-security", icon: Users },
    { label: "Compliance", href: "/compliance", icon: FileText },
    { label: "Agenios (Scanner)", href: "/agenios/scan", icon: BrainCircuit },
    { label: "Threat-Pulse", href: "/threat-pulse", icon: Lock },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="h-full flex flex-col p-6">
            {/* Branding */}
            <div className="mb-10">
                <h1 className="text-2xl font-bold text-slate-100 tracking-tighter flex items-center gap-2">
                    VAJRA
                </h1>
                <p className="text-xs text-red-500 font-medium tracking-widest uppercase">Security Platform</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all group",
                                isActive
                                    ? "bg-red-950/30 text-red-400 border-l-2 border-red-500"
                                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-900"
                            )}
                        >
                            <Icon className={clsx("w-5 h-5", isActive ? "text-red-500" : "text-slate-500 group-hover:text-slate-300")} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer / Status */}
            <div className="mt-auto pt-6 border-t border-slate-800">
                <div className="flex items-center gap-3 text-xs text-slate-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    System Operational
                </div>
            </div>
        </div>
    );
}
