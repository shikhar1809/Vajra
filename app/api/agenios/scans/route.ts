import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        success: true,
        data: {
            scans: []
        }
    });
}

export async function POST() {
    return NextResponse.json({
        success: true,
        data: {
            scanId: crypto.randomUUID(),
            status: 'pending'
        }
    });
}
