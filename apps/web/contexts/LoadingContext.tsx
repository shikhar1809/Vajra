"use client";

import React, { createContext, useContext, useState, ReactNode, useRef, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import FlyingManLoader from '@/components/FlyingManLoader';

interface LoadingContextType {
    isLoading: boolean;
    loadingMessage: string;
    progress: number;
    isFullScreen: boolean;
    startLoading: (message?: string, fullScreen?: boolean) => void;
    stopLoading: () => void;
    setProgress: (progress: number) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
    const [isLoading, setIsLoading] = useState(true);
    const [loadingMessage, setLoadingMessage] = useState('Loading...');
    const [progress, setProgressState] = useState(0);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const startTimeRef = useRef<number>(Date.now());
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Handle Route Changes (Stop Loading)
    useEffect(() => {
        // Stop loading on any navigation
        stopLoading();
    }, [pathname, searchParams]);

    const startLoading = (message = 'Loading...', fullScreen = false) => {
        // Clear any pending stop timers
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        startTimeRef.current = Date.now();
        setLoadingMessage(message);
        setIsFullScreen(fullScreen);
        setProgressState(0);
        setIsLoading(true);
    };

    const stopLoading = () => {
        // If already stopping, don't queue another one
        if (timeoutRef.current) return;

        const elapsedTime = Date.now() - startTimeRef.current;
        const minDuration = 5000; // 5 seconds minimum

        if (elapsedTime < minDuration) {
            const remainingTime = minDuration - elapsedTime;
            timeoutRef.current = setTimeout(() => {
                setProgressState(100);
                setIsLoading(false);
                setProgressState(0);
                timeoutRef.current = null;
            }, remainingTime);
        } else {
            setProgressState(100);
            setIsLoading(false);
            setProgressState(0);
        }
    };

    const setProgress = (newProgress: number) => {
        setProgressState(Math.min(100, Math.max(0, newProgress)));
    };

    return (
        <LoadingContext.Provider value={{
            isLoading,
            loadingMessage,
            progress,
            isFullScreen,
            startLoading,
            stopLoading,
            setProgress
        }}>
            {isLoading && <FlyingManLoader />}
            {children}
        </LoadingContext.Provider>
    );
}

export function useLoading() {
    const context = useContext(LoadingContext);
    if (!context) {
        throw new Error('useLoading must be used within LoadingProvider');
    }
    return context;
}
