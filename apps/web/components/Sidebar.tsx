"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShieldAlert, Users, FileText, Lock, BrainCircuit, Receipt, Code, Shield } from "lucide-react";
import clsx from "clsx";
import GrantAccess, { useCurrentUser } from "./GrantAccess";

const navItems = [
    { label: "Command Center", href: "/command-center", icon: LayoutDashboard },
    { label: "Vendor Risk", href: "/vendor-risk", icon: ShieldAlert },
    { label: "Employee Security", href: "/employee-security", icon: Users },
    { label: "Compliance", href: "/compliance", icon: FileText },
    { label: "Agenios (Scanner)", href: "/agenios/scan", icon: BrainCircuit },
    { label: "Threat-Pulse", href: "/threat-pulse", icon: Lock },
];

// Role-specific navigation items (ZTA: Least Privilege)
const roleSpecificItems = [
    { label: "Financial Reports", href: "/finance/reports", icon: Receipt, requiredRole: "finance" },
    { label: "Invoice Upload", href: "/finance/invoices", icon: Receipt, requiredRole: "finance" },
    { label: "GitHub Audits", href: "/developer/github", icon: Code, requiredRole: "developer" },
    { label: "Code Scanner", href: "/developer/scanner", icon: Code, requiredRole: "developer" },
];

export default function Sidebar() {
    const pathname = usePathname();
    const currentUser = useCurrentUser();

    return (
        <div className="h-full flex flex-col p-6">
            {/* Branding */}
            <div className="mb-10">
                <h1 className="text-2xl font-bold text-slate-100 tracking-tighter flex items-center gap-2">
                    <Shield className="w-6 h-6 text-red-500" />
                    VAJRA
                </h1>
                <p className="text-xs text-red-500 font-medium tracking-widest uppercase">Zero Trust Platform</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2">
                {/* Standard Navigation */}
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

                {/* Role-Specific Navigation (ZTA: Least Privilege) */}
                <div className="pt-4 mt-4 border-t border-slate-800">
                    <p className="text-xs text-slate-600 font-semibold uppercase tracking-wider mb-2 px-4">
                        Role-Specific
                    </p>
                    {roleSpecificItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <GrantAccess key={item.href} requiredRole={item.requiredRole}>
                                <Link
                                    href={item.href}
                                    className={clsx(
                                        "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all group",
                                        isActive
                                            ? "bg-blue-950/30 text-blue-400 border-l-2 border-blue-500"
                                            : "text-slate-400 hover:text-slate-100 hover:bg-slate-900"
                                    )}
                                >
                                    <Icon className={clsx("w-5 h-5", isActive ? "text-blue-500" : "text-slate-500 group-hover:text-slate-300")} />
                                    {item.label}
                                </Link>
                            </GrantAccess>
                        );
                    })}
                </div>
            </nav>

            {/* Footer / ZTA Status */}
            <div className="mt-auto pt-6 border-t border-slate-800 space-y-3">
                <div className="flex items-center gap-3 text-xs text-slate-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    System Operational
                </div>
                <div className="px-3 py-2 bg-slate-900 rounded-lg border border-slate-800">
                    <p className="text-xs text-slate-600 font-semibold uppercase tracking-wider mb-1">
                        ZTA Mode: Active
                    </p>
                    <p className="text-xs text-slate-400">
                        User: <span className="text-blue-400 font-mono">{currentUser.email}</span>
                    </p>
                    <p className="text-xs text-slate-400">
                        Role: <span className="text-green-400 font-semibold capitalize">{currentUser.role}</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
