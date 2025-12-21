'use client'

import { useEffect, useState } from 'react'
import { Globe, MapPin } from 'lucide-react'

interface GeographicMapProps {
    workspaceId: string
    timeRange?: '1h' | '24h' | '7d' | '30d'
    demoData?: any[]
}

interface CountryData {
    country: string
    count: number
    percentage: number
}

export default function GeographicMap({ workspaceId, timeRange = '24h', demoData }: GeographicMapProps) {
    const [countries, setCountries] = useState<CountryData[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (demoData) {
            // Use demo data if provided
            setCountries(demoData)
            setIsLoading(false)
        } else {
            loadGeographicData()
        }
    }, [workspaceId, timeRange, demoData])

    async function loadGeographicData() {
        try {
            setIsLoading(true)
            const response = await fetch(
                `/api/shield/analytics?workspaceId=${workspaceId}&timeRange=${timeRange}`
            )
            const result = await response.json()

            if (result.success) {
                const total = result.data.totalRequests
                const countriesData = result.data.topCountries.map((c: any) => ({
                    country: c.country,
                    count: c.count,
                    percentage: total > 0 ? Math.round((c.count / total) * 100) : 0,
                }))
                setCountries(countriesData)
            }
        } catch (error) {
            console.error('Error loading geographic data:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const getCountryFlag = (countryCode: string) => {
        // Simple flag emoji mapping (extend as needed)
        const flags: Record<string, string> = {
            US: '🇺🇸',
            GB: '🇬🇧',
            IN: '🇮🇳',
            CN: '🇨🇳',
            DE: '🇩🇪',
            FR: '🇫🇷',
            JP: '🇯🇵',
            BR: '🇧🇷',
            CA: '🇨🇦',
            AU: '🇦🇺',
        }
        return flags[countryCode] || '🌍'
    }

    if (isLoading) {
        return (
            <div className="bg-slate-900/20 backdrop-blur-md border border-slate-800 rounded-lg p-6">
                <div className="text-slate-400">Loading geographic data...</div>
            </div>
        )
    }

    return (
        <div className="bg-slate-900/20 backdrop-blur-md border border-slate-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Globe className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-white">Geographic Distribution</h3>
                    <p className="text-sm text-slate-400">Traffic by country</p>
                </div>
            </div>

            {countries.length === 0 ? (
                <div className="text-center py-8">
                    <Globe className="w-16 h-16 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">No traffic data available</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {countries.map((country, index) => (
                        <div key={country.country} className="bg-slate-950/50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{getCountryFlag(country.country)}</span>
                                    <div>
                                        <div className="text-white font-semibold">{country.country}</div>
                                        <div className="text-xs text-slate-500">
                                            {country.count.toLocaleString()} requests
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-blue-400">{country.percentage}%</div>
                                    <div className="text-xs text-slate-500">#{index + 1}</div>
                                </div>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-2">
                                <div
                                    className="bg-blue-500 h-2 rounded-full transition-all"
                                    style={{ width: `${country.percentage}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {countries.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>Top {countries.length} countries</span>
                    </div>
                    <span>Last {timeRange}</span>
                </div>
            )}
        </div>
    )
}
