import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const response = await fetch('http://localhost:8081/logs');
        if (!response.ok) {
            throw new Error(`Shield Service Error: ${response.statusText}`);
        }
        const data = await response.json();
        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('Shield Proxy Error:', error);
        // Fallback or empty data if service is down (for dev resilience)
        return NextResponse.json({ success: false, error: error.message, data: [] });
    }
}
