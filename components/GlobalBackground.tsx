"use client";

import dynamic from "next/dynamic";

// Dynamic import to prevent SSR issues
const Lightning = dynamic(() => import("./Lightning"), { ssr: false });

export default function GlobalBackground() {
    return (
        <>
            {/* Fixed Lightning Background - Covers Entire Viewport */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    width: '100vw',
                    height: '100vh',
                    zIndex: 0,
                    pointerEvents: 'none',
                    overflow: 'hidden'
                }}
            >
                <Lightning
                    hue={0}
                    xOffset={0}
                    speed={1}
                    intensity={1.2}
                    size={1}
                />
            </div>
        </>
    );
}
