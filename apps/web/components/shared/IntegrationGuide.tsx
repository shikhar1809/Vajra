'use client'

import { useState, useEffect } from 'react'
import { X, Copy, Check, Terminal, Code, Shield, Key } from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabase/client'

interface IntegrationGuideProps {
    isOpen: boolean
    onClose: () => void
    module: 'shield' | 'aegis' | 'sentry'
    workspaceId: string
}

export default function IntegrationGuide({ isOpen, onClose, module, workspaceId }: IntegrationGuideProps) {
    const supabase = getSupabaseClient()
    const [apiKey, setApiKey] = useState<string>('Loading...')
    const [copied, setCopied] = useState(false)
    const [activeTab, setActiveTab] = useState<'npm' | 'curl' | 'config'>('npm')

    useEffect(() => {
        if (isOpen) {
            fetchApiKey()
        }
    }, [isOpen])

    async function fetchApiKey() {
        try {
            // Try to find existing key
            const { data, error } = await supabase
                .from('api_keys')
                .select('key')
                .eq('workspace_id', workspaceId)
                .eq('is_active', true)
                .single()

            if (data) {
                setApiKey(data.key)
            } else {
                // Generate new key if none exists (Auto-provision for UX)
                const newKey = `vj_${Math.random().toString(36).substr(2, 9)}_${Math.random().toString(36).substr(2, 9)}`
                await supabase.from('api_keys').insert({
                    workspace_id: workspaceId,
                    key: newKey,
                    name: 'Default Integration Key',
                })
                setApiKey(newKey)
            }
        } catch (e) {
            setApiKey('vj_test_key_123456789') // Fallback for demo
        }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    if (!isOpen) return null

    const getSnippets = () => {
        switch (module) {
            case 'shield':
                return {
                    title: 'Connect Shield Middleware',
                    description: 'Protect your Next.js application by adding this middleware properly.',
                    code: `// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 1. Forward request metadata to Vajra Shield
  try {
    const shieldResponse = await fetch('http://localhost:8081/config/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': '${apiKey}',
        'x-forwarded-for': request.ip || '127.0.0.1'
      },
      body: JSON.stringify({
        path: request.nextUrl.pathname,
        method: request.method,
        headers: Object.fromEntries(request.headers)
      })
    })

    // 2. Block if Shield detects a threat
    if (shieldResponse.status === 403) {
       return new NextResponse(JSON.stringify({ error: 'Blocked by Vajra Shield' }), {
         status: 403, 
         headers: { 'Content-Type': 'application/json' }
       })
    }
  } catch (error) {
    // Fail open (allow traffic) if Shield is unreachable
    console.error("Shield Error", error)
  }

  return NextResponse.next()
}`,
                    lang: 'typescript'
                }
            case 'aegis':
                return {
                    title: 'Setup CI/CD Scanning',
                    description: 'Add this workflow to your GitHub repository to scan every pull request.',
                    code: `# .github/workflows/vajra-scan.yml
name: Vajra Security Scan

on: [push, pull_request]

jobs:
  security_scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run Aegis Scan
        uses: vajra-security/action-aegis@v1
        with:
          api_key: \${{ secrets.VAJRA_API_KEY }}
          workspace_id: '${workspaceId}'
          fail_on_critical: true
      
      - name: Upload Artifacts
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: security-report
          path: vajra-report.json`,
                    lang: 'yaml'
                }
            default:
                return {
                    title: 'API Integration',
                    description: 'Use the Vajra API to check data programmatically.',
                    code: `curl -X POST https://api.vajra.dev/v1/analyze \\
  -H "x-api-key: ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"type": "url", "content": "http://suspicious-link.com"}'`,
                    lang: 'bash'
                }
        }
    }

    const content = getSnippets()

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Terminal className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Integration Guide</h2>
                            <p className="text-slate-400 text-sm">Connect your project to Vajra {module.charAt(0).toUpperCase() + module.slice(1)}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-8">
                    {/* API Key Section */}
                    <div className="bg-slate-950 rounded-lg p-5 border border-slate-800">
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                                <Key className="w-4 h-4 text-amber-500" />
                                Your Workspace API Key
                            </label>
                            <span className="text-xs text-slate-500">Keep this secret</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <code className="flex-1 bg-slate-900 px-4 py-3 rounded-md text-amber-400 font-mono text-sm border border-slate-800 select-all">
                                {apiKey}
                            </code>
                            <button
                                onClick={() => copyToClipboard(apiKey)}
                                className="p-3 bg-slate-800 hover:bg-slate-700 rounded-md text-slate-300 transition-colors"
                                title="Copy Key"
                            >
                                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Code Snippet Section */}
                    <div>
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold text-white mb-1">{content.title}</h3>
                            <p className="text-slate-400 text-sm">{content.description}</p>
                        </div>

                        <div className="relative group">
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => copyToClipboard(content.code)}
                                    className="p-2 bg-slate-700 hover:bg-slate-600 rounded-md text-white shadow-lg"
                                >
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                            <pre className="bg-slate-950 p-6 rounded-lg border border-slate-800 overflow-x-auto">
                                <code className={`language-${content.lang} text-sm font-mono text-slate-300`}>
                                    {content.code}
                                </code>
                            </pre>
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm text-blue-300">
                        <Shield className="w-5 h-5 shrink-0" />
                        <p>
                            Once integrated, traffic and data will automatically appear in your
                            <span className="font-bold text-white ml-1">Live Dashboard</span>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
