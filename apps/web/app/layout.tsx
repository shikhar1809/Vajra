import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import PillNav from "@/components/PillNav";
import ClickSpark from "@/components/effects/ClickSpark";
import { LoadingProvider } from "@/contexts/LoadingContext";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Vajra - Enterprise Cybersecurity Platform",
    description: "Your Digital Fortress - Four powerful tools working together to keep your business safe from cyber threats",
    icons: {
        icon: '/favicon.png',
        apple: '/favicon.png',
    },
};

const navItems = [
    { label: "Home", href: "/" },
    { label: "About Us", href: "/about" },
    { label: "My Workspace", href: "/workspace" }
];

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className} suppressHydrationWarning>
                <Suspense fallback={null}>
                    <LoadingProvider>
                        <ClickSpark
                            sparkColor="#ef4444"
                            sparkSize={12}
                            sparkRadius={20}
                            sparkCount={8}
                            duration={500}
                        >
                            <PillNav
                                logo="/logo.png"
                                logoAlt="Vajra"
                                items={navItems}
                                baseColor="#0f172a"
                                pillColor="#ef4444"
                                hoveredPillTextColor="#ffffff"
                                pillTextColor="#ffffff"
                                initialLoadAnimation={true}
                            />
                            {children}
                        </ClickSpark>
                    </LoadingProvider>
                </Suspense>
            </body>
        </html>
    );
}
