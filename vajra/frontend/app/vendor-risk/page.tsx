'use client'

import { useState, useEffect } from 'react'
import { AlertCircle, TrendingUp } from 'lucide-react'

export default function VendorRisk() {
    const [vendors, setVendors] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    const fetchVendors = async () => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/vendors`)
        const data = await res.json()
        setVendors(data.vendors)
    }

    useEffect(() => {
        fetchVendors()
    }, [])

    const simulateBreach = async (vendorId: string) => {
        setLoading(true)
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/vendors/${vendorId}/breach`, {
            method: 'POST'
        })
        await fetchVendors()
        setLoading(false)
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Vendor Risk Management</h1>

            <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-800">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Vendor</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Risk Score</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Access Level</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Last Audit</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {vendors.map((vendor) => (
                            <tr key={vendor.id} className="hover:bg-slate-800/50 transition-colors">
                                <td className="px-6 py-4 text-sm font-medium text-white">{vendor.name}</td>
                                <td className="px-6 py-4 text-sm text-slate-300">{vendor.category}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-16 h-2 rounded-full bg-slate-700`}>
                                            <div
                                                className={`h-full rounded-full ${vendor.risk_score > 40 ? 'bg-red-500' : vendor.risk_score > 20 ? 'bg-yellow-500' : 'bg-green-500'
                                                    }`}
                                                style={{ width: `${vendor.risk_score}%` }}
                                            />
                                        </div>
                                        <span className="text-sm text-slate-300">{vendor.risk_score}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${vendor.data_access_level === 'Critical' ? 'bg-red-500/20 text-red-400' :
                                            vendor.data_access_level === 'High' ? 'bg-yellow-500/20 text-yellow-400' :
                                                'bg-blue-500/20 text-blue-400'
                                        }`}>
                                        {vendor.data_access_level}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-400">{vendor.last_audit}</td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => simulateBreach(vendor.id)}
                                        disabled={loading}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded text-sm font-semibold transition-colors disabled:opacity-50"
                                    >
                                        <AlertCircle size={16} />
                                        Simulate Breach
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
