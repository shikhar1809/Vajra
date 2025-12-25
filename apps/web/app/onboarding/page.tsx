'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

const BUSINESS_TYPES = [
    { value: 'finance', label: 'Finance & Banking' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'retail', label: 'Retail & E-commerce' },
    { value: 'tech', label: 'Technology' },
    { value: 'education', label: 'Education' },
    { value: 'government', label: 'Government' },
    { value: 'other', label: 'Other' },
]

const COMPANY_SIZES = [
    { value: 'solo', label: 'Just me' },
    { value: '2-10', label: '2-10 employees' },
    { value: '11-50', label: '11-50 employees' },
    { value: '51-200', label: '51-200 employees' },
    { value: '201-500', label: '201-500 employees' },
    { value: '500+', label: '500+ employees' },
]

export default function OnboardingPage() {
    const router = useRouter()
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const [step, setStep] = useState(1)
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        companyName: '',
        businessType: '',
        companySize: '',
        country: '',
        website: '',
    })

    function handleChange(field: string, value: string) {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    function generateSlug(name: string): string {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
    }

    async function handleSubmit() {
        if (!formData.companyName || !formData.businessType || !formData.companySize) {
            alert('Please fill in all required fields')
            return
        }

        try {
            setIsLoading(true)

            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const slug = generateSlug(formData.companyName)

            // Create workspace
            const { data: workspace, error: workspaceError } = await supabase
                .from('workspaces')
                .insert({
                    name: formData.companyName,
                    slug,
                    owner_id: user.id,
                    business_type: formData.businessType,
                    company_size: formData.companySize,
                    country: formData.country || null,
                    website: formData.website || null,
                })
                .select()
                .single()

            if (workspaceError) throw workspaceError

            // Redirect to workspace dashboard
            router.push(`/workspace/${slug}/dashboard`)
        } catch (error: any) {
            console.error('Onboarding error:', error)
            alert(error.message || 'Failed to create workspace')
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
            <div className="max-w-2xl w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
                        Welcome to Vajra
                    </h1>
                    <p className="text-slate-400">Let's set up your workspace</p>
                </div>

                {/* Progress */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-red-500' : 'bg-slate-700'}`} />
                    <div className={`w-12 h-1 ${step >= 2 ? 'bg-red-500' : 'bg-slate-700'}`} />
                    <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-red-500' : 'bg-slate-700'}`} />
                </div>

                {/* Form */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-8">
                    {step === 1 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold mb-6">Tell us about your business</h2>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Company Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.companyName}
                                    onChange={(e) => handleChange('companyName', e.target.value)}
                                    placeholder="Acme Corporation"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Industry <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.businessType}
                                    onChange={(e) => handleChange('businessType', e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                                >
                                    <option value="">Select industry</option>
                                    {BUSINESS_TYPES.map(type => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Company Size <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.companySize}
                                    onChange={(e) => handleChange('companySize', e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                                >
                                    <option value="">Select size</option>
                                    {COMPANY_SIZES.map(size => (
                                        <option key={size.value} value={size.value}>{size.label}</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={() => setStep(2)}
                                disabled={!formData.companyName || !formData.businessType || !formData.companySize}
                                className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Continue →
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold mb-6">Additional details (optional)</h2>

                            <div>
                                <label className="block text-sm font-medium mb-2">Country</label>
                                <input
                                    type="text"
                                    value={formData.country}
                                    onChange={(e) => handleChange('country', e.target.value)}
                                    placeholder="United States"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Website</label>
                                <input
                                    type="url"
                                    value={formData.website}
                                    onChange={(e) => handleChange('website', e.target.value)}
                                    placeholder="https://example.com"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                                />
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setStep(1)}
                                    disabled={isLoading}
                                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    ← Back
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isLoading}
                                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Creating...
                                        </div>
                                    ) : (
                                        'Create Workspace'
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="mt-6 text-center text-sm text-slate-500">
                    <p>You can update these details later in workspace settings</p>
                </div>
            </div>
        </div>
    )
}
