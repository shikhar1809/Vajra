import './FullScreenLoader.css';
import React from 'react';
import Image from 'next/image';

interface FullScreenLoaderProps {
    isLoading: boolean;
    message?: string;
    progress?: number;
}

export default function FullScreenLoader({
    isLoading,
    message = 'Loading Vajra...',
    progress = 0
}: FullScreenLoaderProps) {
    if (!isLoading) return null;

    return (
        <div className="fullscreen-loader">
            <div className="loader-content">
                {/* Logo with slight tilt */}
                <div className="loader-logo-container" style={{ transform: 'rotate(-5deg)' }}>
                    <Image
                        src="/logo-transparent.png"
                        alt="Vajra Logo"
                        width={200}
                        height={200}
                        className="object-contain"
                        priority
                    />
                </div>

                {/* Loading Message */}
                <div className="loader-message">
                    <p className="text-2xl font-bold text-red-500">{message}</p>
                </div>

                {/* Progress Bar */}
                {progress > 0 && (
                    <div className="loader-progress-container">
                        <div className="loader-progress-bar">
                            <div
                                className="loader-progress-fill"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <div className="loader-progress-text">
                            {Math.round(progress)}%
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
