/**
 * Scout Vendor Scores Dashboard
 * A-F graded vendor risk assessment
 */

'use client';

import { useEffect, useState } from 'react';
import { Search, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';

interface VendorScore {
    id: string;
    name: string;
    domain: string;
    overallScore: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    lastScanned: Date;
}

export default function VendorScoresPage() {
    const [vendors, setVendors] = useState<VendorScore[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock data
        setVendors([
            { id: '1', name: 'Acme Corp', domain: 'acme.com', overallScore: 92, grade: 'A', lastScanned: new Date() },
            { id: '2', name: 'TechVendor Inc', domain: 'techvendor.com', overallScore: 78, grade: 'C', lastScanned: new Date() },
            { id: '3', name: 'SecureCloud', domain: 'securecloud.io', overallScore: 45, grade: 'F', lastScanned: new Date() },
        ]);
        setLoading(false);
    }, []);

    const getGradeColor = (grade: string) => {
        const colors = {
            A: 'text-green-400 bg-green-500/10 border-green-500/30',
            B: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
            C: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
            D: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
            F: 'text-red-400 bg-red-500/10 border-red-500/30',
        };
        return colors[grade as keyof typeof colors];
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <Search className="w-8 h-8 text-orange-500" />
                    <h1 className="text-4xl font-bold">Vendor Security Scores</h1>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-green-500/10 to-black border border-green-500/30 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400">High Performers</span>
                            <CheckCircle className="w-5 h-5 text-green-400" />
                        </div>
                        <p className="text-4xl font-bold text-green-400">{vendors.filter(v => v.grade === 'A' || v.grade === 'B').length}</p>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-500/10 to-black border border-yellow-500/30 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400">Needs Attention</span>
                            <AlertCircle className="w-5 h-5 text-yellow-400" />
                        </div>
                        <p className="text-4xl font-bold text-yellow-400">{vendors.filter(v => v.grade === 'C' || v.grade === 'D').length}</p>
                    </div>

                    <div className="bg-gradient-to-br from-red-500/10 to-black border border-red-500/30 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400">High Risk</span>
                            <TrendingDown className="w-5 h-5 text-red-400" />
                        </div>
                        <p className="text-4xl font-bold text-red-400">{vendors.filter(v => v.grade === 'F').length}</p>
                    </div>
                </div>

                {/* Vendor List */}
                <div className="space-y-4">
                    {vendors.map(vendor => (
                        <div key={vendor.id} className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold mb-1">{vendor.name}</h3>
                                    <p className="text-gray-400 text-sm">{vendor.domain}</p>
                                </div>
                                <div className="text-right">
                                    <div className={`inline-block px-6 py-3 rounded-lg border ${getGradeColor(vendor.grade)} mb-2`}>
                                        <span className="text-3xl font-black">Grade {vendor.grade}</span>
                                    </div>
                                    <p className="text-2xl font-bold">{vendor.overallScore}/100</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
