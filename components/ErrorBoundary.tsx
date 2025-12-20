'use client'

import React, { Component, ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

interface Props {
    children: ReactNode
    fallback?: ReactNode
}

interface State {
    hasError: boolean
    error?: Error
}

/**
 * Error Boundary Component
 * Catches React errors and displays fallback UI
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log to error reporting service (Sentry)
        console.error('Error caught by boundary:', error, errorInfo)

        // Send to Sentry if configured
        if (typeof window !== 'undefined' && (window as any).Sentry) {
            (window as any).Sentry.captureException(error, {
                contexts: {
                    react: {
                        componentStack: errorInfo.componentStack,
                    },
                },
            })
        }
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback
            }

            return (
                <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-red-950 flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-slate-900/50 backdrop-blur-md border border-red-500/30 rounded-lg p-8 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>

                        <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>

                        <p className="text-slate-400 mb-6">
                            We're sorry, but something unexpected happened. Please try refreshing the page.
                        </p>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="mb-6 p-4 bg-slate-950 rounded-lg text-left">
                                <p className="text-red-400 text-sm font-mono mb-2">
                                    {this.state.error.message}
                                </p>
                                <pre className="text-xs text-slate-500 overflow-x-auto">
                                    {this.state.error.stack}
                                </pre>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                            >
                                Refresh Page
                            </button>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                            >
                                Go Home
                            </button>
                        </div>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}
