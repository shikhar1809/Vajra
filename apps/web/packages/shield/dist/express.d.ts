import { VajraShieldConfig } from './types';
/**
 * Create Vajra Shield middleware for Express
 */
export declare function vajraShield(config: VajraShieldConfig): (req: any, res: any, next: any) => Promise<any>;
