import { Navbar } from "@/components/layout/Navbar";
// Footer managed by page components 
// Wait, page.tsx had dynamic footer import. layout can have Navbar.
// Let's check if page.tsx had Navbar? No. 
// So layout needs Navbar.

export default function LandingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
                {children}
            </main>
        </div>
    );
}
