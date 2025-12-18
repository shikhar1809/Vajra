/**
 * Vajra Shield - Bunker Mode Challenge System
 * 
 * Implements multiple challenge types to verify legitimate users:
 * 1. OTP (One-Time Password)
 * 2. CAPTCHA Integration
 * 3. Behavioral Analysis
 * 4. Device Fingerprinting
 * 5. Pen Tool Challenge (Draw specific pattern)
 */

import crypto from 'crypto';

export type ChallengeType = 'otp' | 'captcha' | 'behavioral' | 'device_fingerprint' | 'pen_tool';

export interface Challenge {
    id: string;
    type: ChallengeType;
    userId?: string;
    ipAddress: string;
    createdAt: Date;
    expiresAt: Date;
    status: 'pending' | 'completed' | 'failed' | 'expired';
    metadata: Record<string, any>;
}

export interface ChallengeResult {
    success: boolean;
    challengeId: string;
    message: string;
    allowAccess: boolean;
}

/**
 * OTP Challenge Generator
 * Generates time-based one-time passwords
 */
export class OTPChallenge {
    private readonly OTP_LENGTH = 6;
    private readonly OTP_VALIDITY_MINUTES = 5;

    /**
     * Generate a new OTP
     */
    generate(userId: string, email: string): { otp: string; expiresAt: Date } {
        const otp = crypto.randomInt(100000, 999999).toString();
        const expiresAt = new Date(Date.now() + this.OTP_VALIDITY_MINUTES * 60 * 1000);

        // In production, send this via email/SMS
        console.log(`[OTP] Generated for ${email}: ${otp}`);

        return { otp, expiresAt };
    }

    /**
     * Verify OTP
     */
    verify(providedOTP: string, storedOTP: string, expiresAt: Date): boolean {
        if (new Date() > expiresAt) {
            return false; // Expired
        }

        return providedOTP === storedOTP;
    }
}

/**
 * Behavioral Analysis Challenge
 * Analyzes mouse movements, typing patterns, and interaction timing
 */
export class BehavioralChallenge {
    /**
     * Analyze user behavior patterns
     */
    analyze(behaviorData: {
        mouseMovements: Array<{ x: number; y: number; timestamp: number }>;
        keystrokes: Array<{ key: string; timestamp: number }>;
        scrollEvents: Array<{ deltaY: number; timestamp: number }>;
    }): { isHuman: boolean; confidence: number; reasons: string[] } {
        const reasons: string[] = [];
        let humanScore = 0;
        let totalChecks = 0;

        // 1. Mouse movement analysis
        if (behaviorData.mouseMovements.length > 0) {
            totalChecks++;
            const hasNaturalCurves = this.analyzeMouseCurves(behaviorData.mouseMovements);
            if (hasNaturalCurves) {
                humanScore++;
                reasons.push('Natural mouse movement detected');
            } else {
                reasons.push('Robotic mouse movement pattern');
            }
        }

        // 2. Keystroke timing analysis
        if (behaviorData.keystrokes.length > 1) {
            totalChecks++;
            const hasNaturalTiming = this.analyzeKeystrokeTiming(behaviorData.keystrokes);
            if (hasNaturalTiming) {
                humanScore++;
                reasons.push('Human-like typing rhythm');
            } else {
                reasons.push('Mechanical typing pattern');
            }
        }

        // 3. Scroll behavior
        if (behaviorData.scrollEvents.length > 0) {
            totalChecks++;
            const hasNaturalScroll = this.analyzeScrollBehavior(behaviorData.scrollEvents);
            if (hasNaturalScroll) {
                humanScore++;
                reasons.push('Natural scrolling behavior');
            }
        }

        const confidence = totalChecks > 0 ? humanScore / totalChecks : 0;
        const isHuman = confidence >= 0.6; // 60% threshold

        return { isHuman, confidence, reasons };
    }

    private analyzeMouseCurves(movements: Array<{ x: number; y: number; timestamp: number }>): boolean {
        if (movements.length < 3) return false;

        // Calculate curvature - humans don't move in perfectly straight lines
        let totalCurvature = 0;
        for (let i = 1; i < movements.length - 1; i++) {
            const prev = movements[i - 1];
            const curr = movements[i];
            const next = movements[i + 1];

            const angle1 = Math.atan2(curr.y - prev.y, curr.x - prev.x);
            const angle2 = Math.atan2(next.y - curr.y, next.x - curr.x);
            const curvature = Math.abs(angle2 - angle1);

            totalCurvature += curvature;
        }

        const avgCurvature = totalCurvature / (movements.length - 2);
        return avgCurvature > 0.1; // Some curvature indicates human movement
    }

    private analyzeKeystrokeTiming(keystrokes: Array<{ key: string; timestamp: number }>): boolean {
        const intervals: number[] = [];
        for (let i = 1; i < keystrokes.length; i++) {
            intervals.push(keystrokes[i].timestamp - keystrokes[i - 1].timestamp);
        }

        // Calculate variance in timing
        const avg = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
        const variance = intervals.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / intervals.length;

        // Humans have variable timing, bots are consistent
        return variance > 1000; // Milliseconds squared
    }

    private analyzeScrollBehavior(scrollEvents: Array<{ deltaY: number; timestamp: number }>): boolean {
        // Humans have variable scroll speeds and directions
        const deltas = scrollEvents.map(e => e.deltaY);
        const uniqueDeltas = new Set(deltas).size;

        return uniqueDeltas > 2; // Multiple different scroll amounts
    }
}

/**
 * Device Fingerprinting
 * Creates unique identifier based on device characteristics
 */
export class DeviceFingerprint {
    /**
     * Generate device fingerprint
     */
    generate(deviceInfo: {
        userAgent: string;
        screenResolution: string;
        timezone: string;
        language: string;
        platform: string;
        plugins: string[];
        canvas?: string; // Canvas fingerprint
    }): string {
        const fingerprintData = JSON.stringify(deviceInfo);
        return crypto.createHash('sha256').update(fingerprintData).digest('hex');
    }

    /**
     * Verify device fingerprint matches
     */
    verify(currentFingerprint: string, storedFingerprint: string): boolean {
        return currentFingerprint === storedFingerprint;
    }

    /**
     * Calculate similarity between fingerprints (fuzzy matching)
     */
    calculateSimilarity(fp1: string, fp2: string): number {
        if (fp1 === fp2) return 1.0;

        // Simple Hamming distance for hex strings
        let matches = 0;
        const length = Math.min(fp1.length, fp2.length);

        for (let i = 0; i < length; i++) {
            if (fp1[i] === fp2[i]) matches++;
        }

        return matches / length;
    }
}

/**
 * Pen Tool Challenge
 * User must draw a specific pattern (e.g., circle, signature)
 */
export class PenToolChallenge {
    /**
     * Verify drawn pattern matches expected pattern
     */
    verifyPattern(
        drawnPoints: Array<{ x: number; y: number }>,
        expectedPattern: 'circle' | 'line' | 'signature'
    ): { matches: boolean; accuracy: number } {
        switch (expectedPattern) {
            case 'circle':
                return this.verifyCircle(drawnPoints);
            case 'line':
                return this.verifyLine(drawnPoints);
            default:
                return { matches: false, accuracy: 0 };
        }
    }

    private verifyCircle(points: Array<{ x: number; y: number }>): { matches: boolean; accuracy: number } {
        if (points.length < 10) {
            return { matches: false, accuracy: 0 };
        }

        // Calculate center point
        const centerX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
        const centerY = points.reduce((sum, p) => sum + p.y, 0) / points.length;

        // Calculate distances from center
        const distances = points.map(p =>
            Math.sqrt(Math.pow(p.x - centerX, 2) + Math.pow(p.y - centerY, 2))
        );

        const avgRadius = distances.reduce((sum, d) => sum + d, 0) / distances.length;
        const variance = distances.reduce((sum, d) => sum + Math.pow(d - avgRadius, 2), 0) / distances.length;
        const stdDev = Math.sqrt(variance);

        // Low standard deviation means points are evenly distributed (circle-like)
        const accuracy = Math.max(0, 1 - (stdDev / avgRadius));
        const matches = accuracy > 0.7; // 70% threshold

        return { matches, accuracy };
    }

    private verifyLine(points: Array<{ x: number; y: number }>): { matches: boolean; accuracy: number } {
        if (points.length < 5) {
            return { matches: false, accuracy: 0 };
        }

        // Calculate line equation using first and last points
        const start = points[0];
        const end = points[points.length - 1];

        // Calculate how close intermediate points are to the line
        let totalDeviation = 0;
        for (let i = 1; i < points.length - 1; i++) {
            const point = points[i];
            const deviation = this.pointToLineDistance(point, start, end);
            totalDeviation += deviation;
        }

        const avgDeviation = totalDeviation / (points.length - 2);
        const lineLength = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));

        const accuracy = Math.max(0, 1 - (avgDeviation / (lineLength * 0.1)));
        const matches = accuracy > 0.7;

        return { matches, accuracy };
    }

    private pointToLineDistance(
        point: { x: number; y: number },
        lineStart: { x: number; y: number },
        lineEnd: { x: number; y: number }
    ): number {
        const A = point.x - lineStart.x;
        const B = point.y - lineStart.y;
        const C = lineEnd.x - lineStart.x;
        const D = lineEnd.y - lineStart.y;

        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        const param = lenSq !== 0 ? dot / lenSq : -1;

        let xx, yy;

        if (param < 0) {
            xx = lineStart.x;
            yy = lineStart.y;
        } else if (param > 1) {
            xx = lineEnd.x;
            yy = lineEnd.y;
        } else {
            xx = lineStart.x + param * C;
            yy = lineStart.y + param * D;
        }

        const dx = point.x - xx;
        const dy = point.y - yy;

        return Math.sqrt(dx * dx + dy * dy);
    }
}

/**
 * Bunker Mode Orchestrator
 * Manages challenge selection and verification
 */
export class BunkerModeManager {
    private otpChallenge = new OTPChallenge();
    private behavioralChallenge = new BehavioralChallenge();
    private deviceFingerprint = new DeviceFingerprint();
    private penToolChallenge = new PenToolChallenge();

    /**
     * Select appropriate challenge based on threat level
     */
    selectChallenge(threatLevel: 'low' | 'medium' | 'high' | 'critical'): ChallengeType[] {
        switch (threatLevel) {
            case 'low':
                return ['behavioral'];
            case 'medium':
                return ['captcha', 'behavioral'];
            case 'high':
                return ['otp', 'device_fingerprint'];
            case 'critical':
                return ['otp', 'pen_tool', 'device_fingerprint'];
            default:
                return ['captcha'];
        }
    }

    /**
     * Create a new challenge
     */
    createChallenge(type: ChallengeType, userId: string, ipAddress: string): Challenge {
        const id = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        return {
            id,
            type,
            userId,
            ipAddress,
            createdAt: new Date(),
            expiresAt,
            status: 'pending',
            metadata: {},
        };
    }

    /**
     * Verify challenge response
     */
    async verifyChallenge(
        challenge: Challenge,
        response: any
    ): Promise<ChallengeResult> {
        if (new Date() > challenge.expiresAt) {
            return {
                success: false,
                challengeId: challenge.id,
                message: 'Challenge expired',
                allowAccess: false,
            };
        }

        let success = false;

        switch (challenge.type) {
            case 'otp':
                success = this.otpChallenge.verify(
                    response.otp,
                    challenge.metadata.otp,
                    challenge.expiresAt
                );
                break;

            case 'behavioral':
                const behaviorResult = this.behavioralChallenge.analyze(response.behaviorData);
                success = behaviorResult.isHuman && behaviorResult.confidence > 0.6;
                break;

            case 'device_fingerprint':
                const similarity = this.deviceFingerprint.calculateSimilarity(
                    response.fingerprint,
                    challenge.metadata.expectedFingerprint
                );
                success = similarity > 0.9;
                break;

            case 'pen_tool':
                const patternResult = this.penToolChallenge.verifyPattern(
                    response.drawnPoints,
                    challenge.metadata.expectedPattern
                );
                success = patternResult.matches;
                break;

            default:
                success = false;
        }

        return {
            success,
            challengeId: challenge.id,
            message: success ? 'Challenge passed' : 'Challenge failed',
            allowAccess: success,
        };
    }
}

export const bunkerMode = new BunkerModeManager();
