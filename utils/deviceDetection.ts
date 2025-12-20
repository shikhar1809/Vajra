/**
 * Device detection utilities for responsive 3D rendering
 */

export type DeviceType = 'mobile' | 'tablet' | 'desktop';
export type PerformanceMode = 'low' | 'medium' | 'high';

/**
 * Detects the current device type based on viewport width
 */
export const getDeviceType = (): DeviceType => {
    if (typeof window === 'undefined') return 'desktop';

    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
};

/**
 * Detects device performance capabilities
 * Based on CPU cores and available memory
 */
export const getPerformanceMode = (): PerformanceMode => {
    if (typeof window === 'undefined') return 'high';

    const cores = navigator.hardwareConcurrency || 4;
    const memory = (navigator as any).deviceMemory || 4;

    // Low-end devices: ≤4 cores or ≤4GB RAM
    if (cores <= 4 || memory <= 4) return 'low';

    // Mid-range devices: ≤8 cores
    if (cores <= 8) return 'medium';

    // High-end devices: >8 cores
    return 'high';
};

/**
 * Get device pixel ratio, clamped to reasonable values
 */
export const getDevicePixelRatio = (): number => {
    if (typeof window === 'undefined') return 1;
    return Math.min(window.devicePixelRatio || 1, 2);
};

/**
 * Check if device is likely mobile based on touch support and screen size
 */
export const isMobileDevice = (): boolean => {
    if (typeof window === 'undefined') return false;

    return (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.innerWidth < 768
    );
};

/**
 * Check if device is likely a tablet
 */
export const isTabletDevice = (): boolean => {
    if (typeof window === 'undefined') return false;

    const width = window.innerWidth;
    return width >= 768 && width < 1024;
};
