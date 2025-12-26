import Sidebar from "@/components/Sidebar";

export default function WorkspaceLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen w-full">
            {/* Permanent Left Sidebar */}
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
