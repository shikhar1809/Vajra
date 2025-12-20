
export interface ShieldConfig {
    mode: 'monitor' | 'bunker' | 'lockdown';
    rateLimitThreshold: number;
    bunkerTriggerThreshold: number;
}

export interface ShieldRule {
    name: string;
    conditionType: 'country' | 'ip' | 'user_agent';
    conditionValue: string;
    action: 'block' | 'challenge' | 'log';
}

export function evaluateRequest(
    ip: string,
    country: string,
    userAgent: string,
    rate: number,
    config: ShieldConfig,
    rules: ShieldRule[]
): 'allow' | 'challenge' | 'block' {

    // 1. Lockdown Mode
    if (config.mode === 'lockdown') return 'block';

    // 2. Custom Rules
    for (const rule of rules) {
        if (rule.conditionType === 'country' && rule.conditionValue === country) {
            return rule.action as any;
        }
        if (rule.conditionType === 'user_agent' && userAgent.includes(rule.conditionValue)) {
            return rule.action as any;
        }
        if (rule.conditionType === 'ip' && rule.conditionValue === ip) {
            return rule.action as any;
        }
    }

    // 3. Bunker Mode & Rate Limits
    if (config.mode === 'bunker' || rate > config.bunkerTriggerThreshold) {
        return 'challenge';
    }

    if (rate > config.rateLimitThreshold) {
        return 'challenge';
    }

    return 'allow';
}
