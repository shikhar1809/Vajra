// Footer managed by page components 

export default function LandingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-grow">
                {children}
            </main>
        </div>
    );
}
