import { useEffect, useState } from 'react';

interface PageLoadingOptions {
    pageName: string;
    loadingMessage?: string;
    minLoadTime?: number;
}

export function usePageLoading({
    pageName,
    loadingMessage = 'Loading...',
    minLoadTime = 800
}: PageLoadingOptions) {
    const [isPageReady, setIsPageReady] = useState(false);

    useEffect(() => {
        const startTime = Date.now();

        // Simulate minimum loading time for smooth UX
        const timer = setTimeout(() => {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, minLoadTime - elapsed);

            setTimeout(() => {
                setIsPageReady(true);
            }, remaining);
        }, 100);

        return () => clearTimeout(timer);
    }, [minLoadTime]);

    return { isPageReady, loadingMessage };
}
