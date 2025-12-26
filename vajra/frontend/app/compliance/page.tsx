'use client'

import { useState } from 'react'
import { FileText, Download } from 'lucide-react'

export default function Compliance() {
    const [report, setReport] = useState('')
    const [loading, setLoading] = useState(false)

    const generateReport = async () => {
        setLoading(true)
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/compliance/report`)
        const data = await res.json()
        setReport(data.report)
        setLoading(false)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">Compliance & Reporting</h1>
                <button
                    onClick={generateReport}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                    <FileText size={20} />
                    {loading ? 'Generating...' : 'Generate SOC2 Report'}
                </button>
            </div>

            {report ? (
                <div className="bg-slate-900 p-6 rounded-lg border border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-white">SOC2 Compliance Report</h2>
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-sm transition-colors">
                            <Download size={16} />
                            Download
                        </button>
                    </div>
                    <div className="prose prose-invert max-w-none">
                        <div
                            className="text-slate-300 whitespace-pre-wrap"
                            dangerouslySetInnerHTML={{ __html: report.replace(/\n/g, '<br/>') }}
                        />
                    </div>
                </div>
            ) : (
                <div className="bg-slate-900 p-12 rounded-lg border border-slate-800 text-center">
                    <FileText size={64} className="mx-auto text-slate-600 mb-4" />
                    <h2 className="text-xl font-semibold text-slate-400 mb-2">No Report Generated</h2>
                    <p className="text-slate-500">
                        Click "Generate SOC2 Report" to create a compliance report using AI analysis.
                    </p>
                </div>
            )}
        </div>
    )
}
