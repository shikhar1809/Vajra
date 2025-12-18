import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Info, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { SeverityLevel } from "@/lib/constants";

interface AlertBannerProps {
    severity: SeverityLevel;
    title: string;
    message: string;
    onDismiss?: () => void;
    className?: string;
}

const severityConfig = {
    critical: {
        icon: XCircle,
        className: "alert-critical border-2",
    },
    high: {
        icon: AlertTriangle,
        className: "alert-high border-2",
    },
    medium: {
        icon: AlertTriangle,
        className: "alert-medium border-2",
    },
    low: {
        icon: Info,
        className: "alert-low border-2",
    },
    info: {
        icon: CheckCircle2,
        className: "alert-info border-2",
    },
};

export function AlertBanner({ severity, title, message, onDismiss, className }: AlertBannerProps) {
    const config = severityConfig[severity];
    const Icon = config.icon;

    return (
        <Alert className={cn(config.className, className)}>
            <Icon className="h-4 w-4" />
            <AlertTitle className="font-bold">{title}</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
            {onDismiss && (
                <button
                    onClick={onDismiss}
                    className="absolute top-2 right-2 p-1 hover:bg-white/10 rounded transition-colors"
                >
                    <XCircle className="w-4 h-4" />
                </button>
            )}
        </Alert>
    );
}
