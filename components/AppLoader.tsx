"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useLoading } from '@/contexts/LoadingContext';
import LoadingProgressBar from './LoadingProgressBar';
import FullScreenLoader from './FullScreenLoader';

export default function AppLoader() {
    const pathname = usePathname();
    const { isLoading, loadingMessage, progress, isFullScreen, startLoading, stopLoading, setProgress } = useLoading();
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    // Initial app load
    useEffect(() => {
        if (isInitialLoad) {
            startLoading('Initializing Vajra...', true);

            // Simulate preloading assets
            let currentProgress = 0;
            const interval = setInterval(() => {
                currentProgress += Math.random() * 15;
                if (currentProgress >= 100) {
                    currentProgress = 100;
                    clearInterval(interval);
                    setTimeout(() => {
                        stopLoading();
                        setIsInitialLoad(false);
                    }, 500);
                }
                setProgress(currentProgress);
            }, 200);

            return () => clearInterval(interval);
        }
    }, []);

    // Navigation loading
    useEffect(() => {
        if (!isInitialLoad) {
            // Get loading message based on route
            const getLoadingMessage = (path: string) => {
                if (path.includes('/shield')) return 'Initializing Shield Protection...';
                if (path.includes('/scout')) return 'Loading Vendor Intelligence...';
                if (path.includes('/sentry')) return 'Activating Threat Detection...';
                if (path.includes('/agenios')) return 'Preparing Security Scans...';
                return 'Loading...';
            };

            // Start full-screen loading for page transitions
            startLoading(getLoadingMessage(pathname), true);

            // Simulate loading progress
            let currentProgress = 0;
            const interval = setInterval(() => {
                currentProgress += Math.random() * 20 + 10;
                if (currentProgress >= 100) {
                    currentProgress = 100;
                    clearInterval(interval);
                    setTimeout(() => {
                        stopLoading();
                    }, 300);
                }
                setProgress(currentProgress);
            }, 150);

            return () => clearInterval(interval);
        }
    }, [pathname, isInitialLoad]);

    return (
        <>
            {isFullScreen ? (
                <FullScreenLoader
                    isLoading={isLoading}
                    message={loadingMessage}
                    progress={progress}
                />
            ) : (
                <LoadingProgressBar
                    isLoading={isLoading}
                    loadingMessage={loadingMessage}
                />
            )}
        </>
    );
}
