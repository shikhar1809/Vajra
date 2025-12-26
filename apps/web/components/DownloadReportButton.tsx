
import React, { useState } from 'react';

// Use a simple, non-lucide icon or lucide if available. Assuming lucide-react is installed since page.tsx used it.
import { Download } from "lucide-react";

const DownloadReportButton = ({ vendorName }: { vendorName: string }) => {
    const [loading, setLoading] = useState(false);

    const handleDownload = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:8000/api/v1/generate-report?vendor=${encodeURIComponent(vendorName)}`, {
                method: 'GET',
                // No headers needed for GET usually, but good to be explicit we expect something.
            });

            if (!response.ok) throw new Error('Failed to generate report');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `VAJRA_Incident_${vendorName}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Download Error:", error);
            alert("Error generating report. Is the backend running?");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleDownload}
            disabled={loading}
            className={`px-4 py-2 rounded-lg font-bold text-white flex items-center gap-2 transition-all shadow-lg ${loading
                    ? 'bg-slate-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 hover:scale-105'
                }`}
        >
            <Download className={`w-4 h-4 ${loading ? 'animate-bounce' : ''}`} />
            {loading ? 'Generating PDF...' : 'Download Incident Report'}
        </button>
    );
};

export default DownloadReportButton;
