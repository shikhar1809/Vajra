'use client'

import { useState } from 'react'
import { AlertTriangle, CheckCircle, Search, Shield, XCircle, Loader2 } from 'lucide-react'

export default function PhishingScanner() {
    const [url, setUrl] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)

    const handleScan = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!url) return

        setLoading(true)
        setResult(null)
        try {
            const res = await fetch('/api/analysis/scan-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            })
            const data = await res.json()
            if (data.success) {
                setResult(data.data)
            } else {
                // Mock result fallback if service fails (for demo/resilience)
                console.error("Scan failed, using mock", data.error)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-slate-900/20 backdrop-blur-md border border-slate-800 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">Phishing Analysis Engine</h3>
                    <p className="text-slate-400 text-sm">Real-time URL Forensics powered by Python & ML</p>
                </div>
            </div>

            <form onSubmit={handleScan} className="flex gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Enter suspicious URL (e.g., http://g00gle.com)"
                        className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading || !url}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-8 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Scan URL'}
                </button>
            </form>

            {result && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    {/* Risk Gauge */}
                    <div className="bg-slate-950/50 rounded-lg p-6 border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />
                        <h4 className="text-slate-400 uppercase text-xs font-bold tracking-wider mb-4 relative z-10">Threat Risk Score</h4>

                        <div className="relative w-48 h-24 overflow-hidden mb-4">
                            <div className="absolute top-0 left-0 w-full h-full bg-slate-800 rounded-t-full origin-bottom transform scale-100" />
                            <div
                                className={`absolute top-0 left-0 w-full h-full rounded-t-full origin-bottom transition-transform duration-1000 ease-out ${result.risk_score > 70 ? 'bg-red-500' : result.risk_score > 30 ? 'bg-amber-500' : 'bg-green-500'
                                    }`}
                                style={{ transform: `rotate(${(result.risk_score / 100) * 180 - 180}deg)` }}
                            />
                        </div>
                        <div className="text-4xl font-black text-white relative z-10 mb-1">
                            {Math.round(result.risk_score)}<span className="text-base text-slate-500 ml-1">/100</span>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${result.risk_score > 70 ? 'bg-red-500/20 text-red-400' : result.risk_score > 30 ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400'
                            }`}>
                            {result.status}
                        </div>
                    </div>

                    {/* Findings */}
                    <div className="bg-slate-950/50 rounded-lg p-6 border border-slate-800">
                        <h4 className="text-slate-400 uppercase text-xs font-bold tracking-wider mb-4">Forensic Analysis</h4>
                        {result.findings && result.findings.length > 0 ? (
                            <ul className="space-y-3">
                                {result.findings.map((finding: string, i: number) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                                        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                                        {finding}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="flex items-center gap-3 text-green-400">
                                <CheckCircle className="w-5 h-5" />
                                <span className="text-sm font-medium">No threats detected. URL appears safe.</span>
                            </div>
                        )}

                        <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-xs text-slate-500 mb-1">Target</div>
                                <div className="text-sm font-mono text-white truncate" title={result.url}>{result.url}</div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-500 mb-1">Status</div>
                                <div className="text-sm font-mono text-white">{result.status}</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
