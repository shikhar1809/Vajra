"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default function GlobalLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Explicitly identify Landing Page routes
    const isLandingPage = pathname === "/" || pathname === "/about" || pathname === "/contact";

    if (isLandingPage) {
        return (
            <div className="min-h-screen flex flex-col">
                <main className="flex-grow">
                    {children}
                </main>
            </div>
        );
    }

    // Workspace Layout for everything else
    return (
        <div className="flex h-screen w-full">
            {/* Permanent Left Sidebar for Workspace */}
            <div className="w-64 flex-shrink-0 border-r border-slate-800 bg-slate-950">
                <Sidebar />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-auto bg-slate-950 relative">
                {children}
            </div>
        </div>
    );
}
