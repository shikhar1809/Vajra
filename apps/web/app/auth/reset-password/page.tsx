'use client'

import { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'
import Link from 'next/link'

function ResetPasswordContent() {
    const router = useRouter()
    const supabase = getSupabaseClient()
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [message, setMessage] = useState('')

    async function handleResetPassword(e: React.FormEvent) {
        e.preventDefault()

        if (!password || !confirmPassword) {
            setStatus('error')
            setMessage('Please fill in all fields')
            return
        }

        if (password !== confirmPassword) {
            setStatus('error')
            setMessage('Passwords do not match')
            return
        }

        if (password.length < 8) {
            setStatus('error')
            setMessage('Password must be at least 8 characters')
            return
        }

        setIsLoading(true)
        setStatus('idle')

        try {
            const { error } = await supabase.auth.updateUser({
                password: password,
            })

            if (error) {
                setStatus('error')
                setMessage(error.message)
            } else {
                setStatus('success')
                setMessage('Password updated successfully! Redirecting to login...')

                // Redirect to login after 2 seconds
                setTimeout(() => {
                    router.push('/auth/login')
                }, 2000)
            }
        } catch (error) {
            console.error('Password update error:', error)
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
                    <p className="text-slate-400">Set New Password</p>
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
                        <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                            New Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter new password"
                            className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
                            Confirm Password
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            disabled={isLoading}
                            required
                        />
                        <p className="mt-2 text-xs text-slate-500">
                            Password must be at least 8 characters
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
                                Updating...
                            </span>
                        ) : (
                            'Update Password'
                        )}
                    </button>
                </form>

                {/* Links */}
                <div className="mt-6 pt-6 border-t border-slate-800">
                    <p className="text-slate-400 text-sm text-center">
                        <Link href="/auth/login" className="text-red-400 hover:text-red-300 font-semibold">
                            Back to Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white">Loading...</div>}>
            <ResetPasswordContent />
        </Suspense>
    )
}
