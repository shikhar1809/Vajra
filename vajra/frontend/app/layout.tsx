import './globals.css'
import type { Metadata } from 'next'
import Sidebar from '@/components/sidebar'

export const metadata: Metadata = {
    title: 'VAJRA Security Platform',
    description: 'Enterprise Security & Compliance Platform',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>
                <div className="flex min-h-screen bg-slate-950">
                    <Sidebar />
                    <main className="ml-64 flex-1 p-8">
                        {children}
                    </main>
                </div>
            </body>
        </html>
    )
}
