import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();

        // We need to forward the form data (file) to the Python service
        // fetch with FormData automatically sets Content-Type to multipart/form-data
        const response = await fetch('http://localhost:8000/scan-code', {
            method: 'POST',
            body: formData,
            // Duplex is needed for Node 18+ streaming uploads, Next.js might need it
            // @ts-ignore
            duplex: 'half'
        });

        if (!response.ok) {
            throw new Error(`Analysis Service: ${response.statusText}`);
        }

        const data = await response.json();
        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
