'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function VerifyEmailPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const supabase = getSupabaseClient()
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
    const [message, setMessage] = useState('Verifying your email...')

    useEffect(() => {
        async function verifyEmail() {
            try {
                // Check if this is a callback from email verification
                const token_hash = searchParams?.get('token_hash')
                const type = searchParams?.get('type')

                if (token_hash && type === 'email') {
                    // Verify the email token
                    const { error } = await supabase.auth.verifyOtp({
                        token_hash,
                        type: 'email',
                    })

                    if (error) {
                        setStatus('error')
                        setMessage(error.message)
                        return
                    }

                    setStatus('success')
                    setMessage('Email verified successfully! Redirecting to workspace...')

                    // Redirect to workspace after 2 seconds
                    setTimeout(() => {
                        router.push('/workspace')
                    }, 2000)
                } else {
                    // No token, just show instructions
                    setStatus('success')
                    setMessage('Please check your email for the verification link.')
                }
            } catch (error) {
                console.error('Verification error:', error)
                setStatus('error')
                setMessage('An error occurred during verification. Please try again.')
            }
        }

        verifyEmail()
    }, [searchParams, router, supabase])

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-red-950 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-slate-900/50 backdrop-blur-md border border-slate-800/50 rounded-lg p-8">
                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black text-white mb-2">VAJRA</h1>
                    <p className="text-slate-400">Email Verification</p>
                </div>

                {/* Status */}
                <div className="text-center">
                    {status === 'verifying' && (
                        <div className="space-y-4">
                            <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                            <p className="text-white text-lg">{message}</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="space-y-4">
                            <div className="w-16 h-16 bg-green-500/20 border-2 border-green-500 rounded-full flex items-center justify-center mx-auto">
                                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <p className="text-white text-lg font-semibold">{message}</p>
                            <p className="text-slate-400 text-sm">You will be redirected automatically...</p>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="space-y-4">
                            <div className="w-16 h-16 bg-red-500/20 border-2 border-red-500 rounded-full flex items-center justify-center mx-auto">
                                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <p className="text-red-400 text-lg font-semibold">Verification Failed</p>
                            <p className="text-slate-400 text-sm">{message}</p>
                            <div className="pt-4">
                                <Link
                                    href="/auth/login"
                                    className="inline-block bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                                >
                                    Back to Login
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Help Text */}
                <div className="mt-8 pt-6 border-t border-slate-800">
                    <p className="text-slate-400 text-sm text-center">
                        Didn't receive an email?{' '}
                        <Link href="/auth/signup" className="text-red-400 hover:text-red-300">
                            Resend verification
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
