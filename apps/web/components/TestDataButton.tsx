'use client'

import { TestTube, X } from 'lucide-react'

interface TestDataButtonProps {
    module: string
    onGenerate: () => void
    onClear?: () => void
    hasData: boolean
    count?: number
    className?: string
}

export default function TestDataButton({
    module,
    onGenerate,
    onClear,
    hasData,
    count,
    className = ''
}: TestDataButtonProps) {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            {hasData ? (
                <>
                    {/* Test Data Active Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 border border-blue-500/40 rounded-lg text-blue-400 text-sm font-medium">
                        <TestTube className="w-4 h-4" />
                        <span>Test Data Active</span>
                        {count && <span className="text-blue-300">({count})</span>}
                    </div>

                    {/* Clear Button */}
                    {onClear && (
                        <button
                            onClick={() => {
                                if (confirm('Clear all test data for this module?')) {
                                    onClear()
                                }
                            }}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-500/20 border border-red-500/40 rounded-lg text-red-400 text-sm font-medium hover:bg-red-500/30 transition-colors"
                            title="Clear test data"
                        >
                            <X className="w-4 h-4" />
                            <span>Clear</span>
                        </button>
                    )}
                </>
            ) : (
                /* Add Test Data Button */
                <button
                    onClick={onGenerate}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all hover:scale-105 shadow-lg shadow-blue-900/30"
                >
                    <TestTube className="w-5 h-5" />
                    <span>Add Test Data</span>
                </button>
            )}
        </div>
    )
}
