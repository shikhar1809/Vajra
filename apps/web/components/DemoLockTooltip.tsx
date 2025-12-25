import { Info, Lock } from 'lucide-react'

interface DemoLockTooltipProps {
    isLocked: boolean
    reason: string
    modulesWithData: string[]
    children: React.ReactNode
}

export default function DemoLockTooltip({ isLocked, reason, modulesWithData, children }: DemoLockTooltipProps) {
    if (!isLocked) {
        return <>{children}</>
    }

    return (
        <div className="relative group">
            {children}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-50 w-80">
                <div className="bg-slate-900 border border-amber-500/50 rounded-lg p-4 shadow-xl">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Lock className="w-4 h-4 text-amber-500" />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-semibold text-white mb-2">Demo Mode Locked</h4>
                            <p className="text-xs text-slate-300 mb-3">{reason}</p>

                            {modulesWithData.length > 0 && (
                                <div className="mb-3">
                                    <p className="text-xs text-slate-400 mb-1">Modules with real data:</p>
                                    <div className="flex flex-wrap gap-1">
                                        {modulesWithData.map((module) => (
                                            <span
                                                key={module}
                                                className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded text-xs font-medium"
                                            >
                                                {module}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex items-start gap-2 text-xs text-slate-400 bg-slate-950/50 rounded p-2">
                                <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                <p>To unlock demo mode, delete all manual entries from the modules listed above.</p>
                            </div>
                        </div>
                    </div>
                    {/* Arrow */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
                        <div className="w-3 h-3 bg-slate-900 border-r border-b border-amber-500/50 transform rotate-45"></div>
                    </div>
                </div>
            </div>
        </div>
    )
}
