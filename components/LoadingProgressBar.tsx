import './LoadingProgressBar.css';
import React, { useEffect, useState } from 'react';
import GradientText from './GradientText';

interface LoadingProgressBarProps {
    isLoading: boolean;
    loadingMessage?: string;
}

export default function LoadingProgressBar({
    isLoading,
    loadingMessage = 'Loading...'
}: LoadingProgressBarProps) {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (isLoading) {
            setProgress(0);
            const interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 90) return prev;
                    return prev + Math.random() * 10;
                });
            }, 200);

            return () => clearInterval(interval);
        } else {
            setProgress(100);
            setTimeout(() => setProgress(0), 500);
        }
    }, [isLoading]);

    if (!isLoading && progress === 0) return null;

    return (
        <div className="loading-progress-container">
            <div className="loading-progress-bar">
                <div
                    className="loading-progress-fill"
                    style={{ width: `${progress}%` }}
                />
            </div>
            <div className="loading-message">
                <GradientText
                    colors={['#ef4444', '#dc2626', '#b91c1c', '#dc2626', '#ef4444']}
                    animationSpeed={2}
                    showBorder={false}
                    className="text-sm font-semibold"
                >
                    {loadingMessage}
                </GradientText>
            </div>
        </div>
    );
}
