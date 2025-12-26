'use client'

import { useState, Suspense } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import Link from 'next/link'

function ForgotPasswordContent() {
    const supabase = getSupabaseClient()
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [message, setMessage] = useState('')

    async function handleResetPassword(e: React.FormEvent) {
        e.preventDefault()

        if (!email) {
            setStatus('error')
            setMessage('Please enter your email address')
            return
        }

        setIsLoading(true)
        setStatus('idle')

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/reset-password`,
            })

            if (error) {
                setStatus('error')
                setMessage(error.message)
            } else {
                setStatus('success')
                setMessage('Password reset link sent! Please check your email.')
                setEmail('')
            }
        } catch (error) {
            console.error('Password reset error:', error)
            setStatus('error')
            setMessage('An error occurred. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-red-950 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-slate-900/50 backdrop-blur-md border border-slate-800/50 rounded-lg p-8">
                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black text-white mb-2">VAJRA</h1>
                    <p className="text-slate-400">Reset Your Password</p>
                </div>

                {/* Status Messages */}
                {status === 'success' && (
                    <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
                        <p className="text-green-400 text-sm">{message}</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                        <p className="text-red-400 text-sm">{message}</p>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleResetPassword} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            disabled={isLoading}
                            required
                        />
                        <p className="mt-2 text-xs text-slate-500">
                            We'll send you a link to reset your password
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                Sending...
                            </span>
                        ) : (
                            'Send Reset Link'
                        )}
                    </button>
                </form>

                {/* Links */}
                <div className="mt-6 pt-6 border-t border-slate-800 space-y-3">
                    <p className="text-slate-400 text-sm text-center">
                        Remember your password?{' '}
                        <Link href="/auth/login" className="text-red-400 hover:text-red-300 font-semibold">
                            Sign in
                        </Link>
                    </p>
                    <p className="text-slate-400 text-sm text-center">
                        Don't have an account?{' '}
                        <Link href="/auth/signup" className="text-red-400 hover:text-red-300 font-semibold">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default function ForgotPasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white">Loading...</div>}>
            <ForgotPasswordContent />
        </Suspense>
    )
}
