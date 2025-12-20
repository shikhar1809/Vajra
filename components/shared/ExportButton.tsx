'use client'

import { useState } from 'react'
import { Download, FileText, Loader2 } from 'lucide-react'

interface ExportButtonProps {
    module: 'shield' | 'scout' | 'sentry' | 'aegis'
    workspaceId: string
    label?: string
}

export default function ExportButton({ module, workspaceId, label = 'Export' }: ExportButtonProps) {
    const [isExporting, setIsExporting] = useState(false)

    const handleExport = async () => {
        try {
            setIsExporting(true)

            // Call export API
            const response = await fetch(
                `/api/export/${module}?workspaceId=${workspaceId}&format=csv`
            )

            if (!response.ok) {
                throw new Error('Export failed')
            }

            // Get CSV content
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)

            // Trigger download
            const link = document.createElement('a')
            link.href = url
            link.download = `${module}-export-${Date.now()}.csv`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            // Cleanup
            window.URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Export error:', error)
            alert('Export failed. Please try again.')
        } finally {
            setIsExporting(false)
        }
    }

    return (
        <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isExporting ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Exporting...</span>
                </>
            ) : (
                <>
                    <Download className="w-4 h-4" />
                    <span>{label}</span>
                </>
            )}
        </button>
    )
}
