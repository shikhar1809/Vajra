"use client";

import Link from "next/link";
import { Shield, Menu, X, Bell } from "lucide-react";
import { useState } from "react";

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    const navLinks = [
        { name: "Shield", href: "/shield" },
        { name: "Scout", href: "/scout" },
        { name: "Sentry", href: "/sentry" },
        { name: "Agenios", href: "/agenios" },
    ];

    return (
        <nav className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-lg border-b border-slate-800 shadow-lg">
            <div className="container mx-auto px-6">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <img src="/logo.png" alt="Vajra" className="w-10 h-10" />
                        <span className="text-xl font-bold text-white group-hover:text-red-400 transition-colors">
                            Vajra
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-slate-300 hover:text-red-400 font-medium transition-colors"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Right Side Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        <button className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                            <Bell className="w-5 h-5" />
                        </button>
                        <Link
                            href="/shield"
                            className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-semibold hover:from-red-600 hover:to-red-700 hover:shadow-lg hover:shadow-red-500/50 transition-all"
                        >
                            Get Started
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden p-2 text-slate-300 hover:bg-slate-800 rounded-lg"
                    >
                        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="md:hidden py-4 border-t border-slate-800">
                        <div className="flex flex-col gap-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-2 text-slate-300 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-colors"
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <Link
                                href="/shield"
                                onClick={() => setIsOpen(false)}
                                className="mx-4 mt-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-semibold text-center hover:from-red-600 hover:to-red-700 transition-all"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
