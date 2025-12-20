import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { solution } = body;

        // Verify the solution (Using hardcoded '12' for demo)
        if (solution === '12') {
            // Success! Set a clearance cookie
            const response = NextResponse.json({ success: true });
            response.cookies.set('vajra-shield-token', 'verified', {
                path: '/',
                httpOnly: true, // Secure, JavaScript can't access
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24, // 24 hours
            });

            return response;
        }

        return NextResponse.json(
            { success: false, message: 'Invalid solution' },
            { status: 400 }
        );
    } catch (error) {
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
