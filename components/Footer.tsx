import Link from "next/link";
import { Linkedin } from "lucide-react";

export default function Footer() {
    return (
        <footer className="w-full py-8 bg-black border-t border-slate-900">
            <div className="container mx-auto px-6 flex flex-col items-center justify-center gap-4">
                <p className="text-slate-400 text-sm font-medium text-center">
                    Created and maintained by{" "}
                    <span className="text-red-500 font-bold">Shikhar Shahi</span>{" "}
                    (Afterburners)
                </p>

                <Link
                    href="https://www.linkedin.com/in/shikhar-shahi-7934a327a/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-red-500/30 rounded-full transition-all group"
                >
                    <Linkedin className="w-4 h-4 text-slate-400 group-hover:text-red-400 transition-colors" />
                    <span className="text-slate-400 text-sm group-hover:text-white transition-colors">Connect on LinkedIn</span>
                </Link>
            </div>
        </footer>
    );
}
