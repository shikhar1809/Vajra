import type { Metadata } from "next";
import GlobalLayout from "@/components/GlobalLayout";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { LoadingProvider } from "@/contexts/LoadingContext";
// LoadingProvider already imported on line 5

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Vajra - Enterprise Cybersecurity Platform",
    description: "Your Digital Fortress - Four powerful tools working together to keep your business safe from cyber threats",
    icons: {
        icon: '/favicon.png',
        apple: '/favicon.png',
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.className} bg-slate-950 text-slate-200 overflow-hidden`} suppressHydrationWarning>
                <Suspense fallback={null}>
                    <LoadingProvider>
                        <GlobalLayout>
                            {children}
                        </GlobalLayout>
                    </LoadingProvider>
                </Suspense>
            </body>
        </html>
    );
}
