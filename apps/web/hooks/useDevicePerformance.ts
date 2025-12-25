import { useState, useEffect } from 'react';
import { getDeviceType, getPerformanceMode, DeviceType, PerformanceMode } from '@/utils/deviceDetection';

export interface DevicePerformance {
    deviceType: DeviceType;
    performanceMode: PerformanceMode;
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
}

/**
 * Hook to detect device type and performance capabilities
 * Updates on window resize for responsive behavior
 */
export const useDevicePerformance = (): DevicePerformance => {
    const [deviceType, setDeviceType] = useState<DeviceType>(() =>
        typeof window !== 'undefined' ? getDeviceType() : 'desktop'
    );

    const [performanceMode] = useState<PerformanceMode>(() =>
        typeof window !== 'undefined' ? getPerformanceMode() : 'high'
    );

    useEffect(() => {
        const handleResize = () => {
            setDeviceType(getDeviceType());
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return {
        deviceType,
        performanceMode,
        isMobile: deviceType === 'mobile',
        isTablet: deviceType === 'tablet',
        isDesktop: deviceType === 'desktop',
    };
};
