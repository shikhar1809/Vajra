import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const response = await fetch('http://localhost:8000/scan-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            // Fallback for demo if service not running
            const errText = await response.text();
            throw new Error(`Analysis Service: ${errText}`);
        }

        const data = await response.json();
        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error("Sentry Proxy Error", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
