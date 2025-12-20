'use client';

import React, { useState } from 'react';
import { Shield, Lock, CheckCircle, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function BunkerChallengePage() {
    const router = useRouter();
    const [answer, setAnswer] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Simple math challenge for demo purposes
    // In production, this would be a real CAPTCHA or OTP input
    const [challenge] = useState({ q: '7 + 5', a: '12' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        if (answer !== challenge.a) {
            setError('Incorrect answer, please try again.');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/shield/verify', {
                method: 'POST',
                body: JSON.stringify({ solution: answer }),
                headers: { 'Content-Type': 'application/json' },
            });

            if (response.ok) {
                // Redirect back to home or dashboard
                router.push('/');
                router.refresh();
            } else {
                setError('Verification failed.');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                {/* Background Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ef444410_1px,transparent_1px),linear-gradient(to_bottom,#ef444410_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />

                <div className="relative z-10 text-center">
                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/50 animate-pulse">
                        <Shield className="w-10 h-10 text-red-500" />
                    </div>

                    <h1 className="text-3xl font-bold text-white mb-2">Bunker Mode Activated</h1>
                    <p className="text-slate-400 mb-8">
                        Unusual traffic detected from your IP. Complete the security check to continue.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                            <div className="flex items-center justify-center gap-2 mb-4">
                                <Lock className="w-4 h-4 text-slate-400" />
                                <span className="text-sm font-medium text-slate-300">Security Challenge</span>
                            </div>

                            <div className="text-2xl font-mono font-bold text-white mb-4">
                                {challenge.q} = ?
                            </div>

                            <input
                                type="text"
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                placeholder="Enter verification code"
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-center text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
                                autoFocus
                            />
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-red-500 text-sm justify-center bg-red-500/10 p-2 rounded-lg">
                                <AlertTriangle className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3.5 rounded-lg transition-all flex items-center justify-center gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''
                                }`}
                        >
                            {isLoading ? 'Verifying...' : 'Verify Access'}
                            {!isLoading && <CheckCircle className="w-5 h-5" />}
                        </button>
                    </form>
                </div>
            </div>

            <p className="mt-8 text-slate-500 text-sm font-mono">
                VAJRA SECURITY PROTOCOL • ID: {Math.random().toString(36).substring(7).toUpperCase()}
            </p>
        </div>
    );
}
