import Link from "next/link";

export default function Footer() {
    return (
        <footer className="fixed bottom-4 right-4 z-50">
            <div className="text-xs text-slate-500 hover:text-slate-400 transition-colors">
                <p className="mb-1">Created and Maintained by</p>
                <Link
                    href="https://www.linkedin.com/in/shikhar-shahi-7934a327a/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold hover:text-red-400 transition-colors"
                >
                    Shikhar Shahi
                </Link>
            </div>
        </footer>
    );
}
