'use client'

import { Users } from 'lucide-react'

export default function EmployeeSecurity() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Employee Security</h1>

            <div className="bg-slate-900 p-12 rounded-lg border border-slate-800 text-center">
                <Users size={64} className="mx-auto text-slate-600 mb-4" />
                <h2 className="text-xl font-semibold text-slate-400 mb-2">Coming Soon</h2>
                <p className="text-slate-500">
                    Employee security monitoring and training features will be available here.
                </p>
            </div>
        </div>
    )
}
