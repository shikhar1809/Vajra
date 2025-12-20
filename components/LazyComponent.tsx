import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';

interface LazyComponentProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    rootMargin?: string;
}

/**
 * LazyComponent - Renders children only when they enter the viewport
 * Uses Intersection Observer for optimal performance
 */
export default function LazyComponent({
    children,
    fallback = null,
    rootMargin = '200px'
}: LazyComponentProps) {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, [rootMargin]);

    return (
        <div ref={ref}>
            {isVisible ? children : fallback}
        </div>
    );
}
