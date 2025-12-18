import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import PillNav from "@/components/PillNav";
import ClickSpark from "@/components/effects/ClickSpark";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Vajra - Enterprise Cybersecurity Platform",
    description: "Your Digital Fortress - Four powerful tools working together to keep your business safe from cyber threats",
};

const navItems = [
    { label: "Home", href: "/" },
    { label: "Shield", href: "/shield" },
    { label: "Scout", href: "/scout" },
    { label: "Sentry", href: "/sentry" },
    { label: "Agenios", href: "/agenios/scan" }
];

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className} suppressHydrationWarning>
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
            </body>
        </html>
    );
}
