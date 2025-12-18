import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    className?: string;
    iconColor?: string;
}

export function StatCard({ title, value, icon: Icon, trend, className, iconColor = "text-cyber-blue" }: StatCardProps) {
    return (
        <Card className={cn("stat-card", className)}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">{title}</CardTitle>
                <Icon className={cn("w-5 h-5", iconColor)} />
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold text-slate-900">
                    {typeof value === 'number' && isNaN(value) ? '0' : value}
                </div>
                {trend && (
                    <p className={cn(
                        "text-xs mt-1",
                        trend.isPositive ? "text-green-500" : "text-red-500"
                    )}>
                        {trend.isPositive ? "+" : ""}{trend.value}% from last period
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
