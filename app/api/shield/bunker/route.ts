import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Challenge types
type ChallengeType = 'captcha' | 'math' | 'pattern' | 'slider';

interface Challenge {
    id: string;
    type: ChallengeType;
    question: string;
    answer: string;
    options?: string[];
    expiresAt: number;
}

// Generate a random challenge
function generateChallenge(): Challenge {
    const types: ChallengeType[] = ['captcha', 'math', 'pattern', 'slider'];
    const type = types[Math.floor(Math.random() * types.length)];
    const id = crypto.randomBytes(16).toString('hex');
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    switch (type) {
        case 'math': {
            const a = Math.floor(Math.random() * 20) + 1;
            const b = Math.floor(Math.random() * 20) + 1;
            const operations = ['+', '-', '*'];
            const op = operations[Math.floor(Math.random() * operations.length)];

            let answer: number;
            switch (op) {
                case '+': answer = a + b; break;
                case '-': answer = a - b; break;
                case '*': answer = a * b; break;
                default: answer = 0;
            }

            return {
                id,
                type,
                question: `What is ${a} ${op} ${b}?`,
                answer: answer.toString(),
                expiresAt,
            };
        }

        case 'pattern': {
            const patterns = [
                { question: 'What comes next: 2, 4, 6, 8, ?', answer: '10' },
                { question: 'What comes next: 1, 1, 2, 3, 5, ?', answer: '8' },
                { question: 'What comes next: 10, 20, 30, 40, ?', answer: '50' },
                { question: 'What comes next: A, C, E, G, ?', answer: 'I' },
            ];
            const pattern = patterns[Math.floor(Math.random() * patterns.length)];

            return {
                id,
                type,
                question: pattern.question,
                answer: pattern.answer,
                expiresAt,
            };
        }

        case 'captcha': {
            const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
            const captcha = Array.from({ length: 6 }, () =>
                chars[Math.floor(Math.random() * chars.length)]
            ).join('');

            return {
                id,
                type,
                question: `Enter the code: ${captcha}`,
                answer: captcha,
                expiresAt,
            };
        }

        case 'slider': {
            const target = Math.floor(Math.random() * 100);
            return {
                id,
                type,
                question: `Slide to ${target}`,
                answer: target.toString(),
                expiresAt,
            };
        }
    }
}

// Store active challenges in memory (in production, use Redis)
const activeChallenges = new Map<string, Challenge>();

// POST - Get a new challenge
export async function POST(request: Request) {
    try {
        const { ip } = await request.json();

        // Generate challenge
        const challenge = generateChallenge();

        // Store challenge
        activeChallenges.set(challenge.id, challenge);

        // Clean up expired challenges
        for (const [id, ch] of activeChallenges.entries()) {
            if (ch.expiresAt < Date.now()) {
                activeChallenges.delete(id);
            }
        }

        // Log bunker mode activation
        await supabase.from('anomaly_events').insert({
            type: 'bot_attack',
            severity: 'high',
            description: `Bunker mode challenge issued to ${ip}`,
            ip_address: ip,
            bunker_mode_activated: true,
        });

        return NextResponse.json({
            success: true,
            data: {
                challengeId: challenge.id,
                type: challenge.type,
                question: challenge.question,
                options: challenge.options,
                expiresAt: challenge.expiresAt,
            },
        });
    } catch (error) {
        console.error('Challenge generation error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to generate challenge' },
            { status: 500 }
        );
    }
}

// PUT - Verify challenge answer
export async function PUT(request: Request) {
    try {
        const { challengeId, answer, ip } = await request.json();

        // Get challenge
        const challenge = activeChallenges.get(challengeId);

        if (!challenge) {
            return NextResponse.json({
                success: false,
                error: 'Challenge not found or expired',
            }, { status: 400 });
        }

        // Check if expired
        if (challenge.expiresAt < Date.now()) {
            activeChallenges.delete(challengeId);
            return NextResponse.json({
                success: false,
                error: 'Challenge expired',
            }, { status: 400 });
        }

        // Verify answer
        const isCorrect = answer.toString().toLowerCase() === challenge.answer.toLowerCase();

        // Delete challenge after verification
        activeChallenges.delete(challengeId);

        // Log result
        await supabase.from('anomaly_events').insert({
            type: 'bot_attack',
            severity: isCorrect ? 'low' : 'high',
            description: `Bunker mode challenge ${isCorrect ? 'passed' : 'failed'} by ${ip}`,
            ip_address: ip,
            bunker_mode_activated: !isCorrect,
            resolved: isCorrect,
        });

        return NextResponse.json({
            success: true,
            data: {
                verified: isCorrect,
                message: isCorrect ? 'Challenge passed!' : 'Incorrect answer',
            },
        });
    } catch (error) {
        console.error('Challenge verification error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to verify challenge' },
            { status: 500 }
        );
    }
}
