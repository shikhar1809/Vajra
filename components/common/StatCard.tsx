import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    iconColor?: string;
}

export const StatCard = React.memo<StatCardProps>(({
    title,
    value,
    icon: Icon,
    trend,
    iconColor = "text-red-400"
}) => {
    return (
        <div className="cyber-card p-6">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm text-gray-400 mb-2">{title}</p>
                    <p className="text-3xl font-bold text-white">{value}</p>
                    {trend && (
                        <div className={`flex items-center gap-1 mt-2 text-sm ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                            <span>{trend.isPositive ? '↑' : '↓'}</span>
                            <span>{Math.abs(trend.value)}%</span>
                        </div>
                    )}
                </div>
                <div className={`p-3 bg-white/5 rounded-lg ${iconColor}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </div>
    );
});

StatCard.displayName = 'StatCard';
