"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useLoading } from '@/contexts/LoadingContext';
import LoadingProgressBar from './LoadingProgressBar';

export default function NavigationLoader() {
    const pathname = usePathname();
    const { isLoading, loadingMessage, startLoading, stopLoading } = useLoading();

    useEffect(() => {
        // Get loading message based on route
        const getLoadingMessage = (path: string) => {
            if (path.includes('/shield')) return 'Loading Shield Protection...';
            if (path.includes('/scout')) return 'Loading Vendor Intelligence...';
            if (path.includes('/sentry')) return 'Loading Threat Detection...';
            if (path.includes('/agenios')) return 'Loading Security Scanner...';
            return 'Loading Vajra...';
        };

        // Start loading when route changes
        startLoading(getLoadingMessage(pathname));

        // Simulate loading completion
        const timer = setTimeout(() => {
            stopLoading();
        }, 800);

        return () => clearTimeout(timer);
    }, [pathname]);

    return <LoadingProgressBar isLoading={isLoading} loadingMessage={loadingMessage} />;
}
