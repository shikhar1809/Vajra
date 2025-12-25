import { NextRequest, NextResponse } from 'next/server';
import { VajraShieldConfig } from './types';
/**
 * Create Vajra Shield middleware for Next.js
 */
export declare function createVajraShield(config: VajraShieldConfig): (request: NextRequest) => Promise<NextResponse<unknown>>;
/**
 * Protect individual API route
 */
export declare function vajraProtect(handler: (req: any, res: any) => Promise<any>, config?: Partial<VajraShieldConfig>): (req: any, res: any) => Promise<any>;
