'use client'

import { useState } from 'react'
import { Upload, FileCode, AlertCircle } from 'lucide-react'

export default function FileUpload() {
    const [file, setFile] = useState<File | null>(null)
    const [result, setResult] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [dragActive, setDragActive] = useState(false)

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0])
        }
    }

    const handleUpload = async () => {
        if (!file) return

        setLoading(true)
        const formData = new FormData()
        formData.append('file', file)

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/scan/upload`, {
            method: 'POST',
            body: formData
        })

        const data = await res.json()
        setResult(data)
        setLoading(false)
    }

    return (
        <div className="space-y-4">
            <div
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${dragActive
                        ? 'border-red-500 bg-red-500/10'
                        : 'border-slate-700 hover:border-slate-600'
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <FileCode size={48} className="mx-auto text-slate-600 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                    {file ? file.name : 'Drop code file here'}
                </h3>
                <p className="text-sm text-slate-400 mb-4">
                    Supports: .py, .js, .ts, .java, .go, .rb
                </p>
                <input
                    type="file"
                    onChange={(e) => e.target.files && setFile(e.target.files[0])}
                    className="hidden"
                    id="file-upload"
                />
                <label
                    htmlFor="file-upload"
                    className="inline-block px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded cursor-pointer transition-colors"
                >
                    Browse Files
                </label>
            </div>

            {file && (
                <button
                    onClick={handleUpload}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                    <Upload size={20} />
                    {loading ? 'Scanning...' : 'Scan with Semgrep + AI'}
                </button>
            )}

            {result && (
                <div className="bg-slate-900 p-6 rounded-lg border border-slate-800">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertCircle className={result.status === 'vulnerable' ? 'text-red-500' : 'text-green-500'} />
                        <h3 className="text-lg font-semibold text-white">
                            Scan Result: {result.status.toUpperCase()}
                        </h3>
                    </div>

                    {result.ai_fix && (
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-sm font-semibold text-slate-400 mb-2">Vulnerability</h4>
                                <p className="text-white">{result.ai_fix.vulnerability}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-slate-400 mb-2">Severity</h4>
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${result.ai_fix.severity === 'High' ? 'bg-red-500/20 text-red-400' :
                                        result.ai_fix.severity === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                            'bg-blue-500/20 text-blue-400'
                                    }`}>
                                    {result.ai_fix.severity}
                                </span>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-slate-400 mb-2">Explanation</h4>
                                <p className="text-slate-300 text-sm">{result.ai_fix.explanation}</p>
                            </div>
                            {result.ai_fix.diff && (
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-400 mb-2">Fix (DIFF)</h4>
                                    <pre className="bg-slate-950 p-4 rounded text-xs text-green-400 overflow-x-auto">
                                        {result.ai_fix.diff}
                                    </pre>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
