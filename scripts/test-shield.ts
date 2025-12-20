
// 1. Import Logic from Pure Evaluator
import { evaluateRequest } from '../lib/shield/shield-evaluator';

// 2. Define Test Data
const MOCK_CONFIG = {
    mode: 'monitor' as const,
    rateLimitThreshold: 100,
    bunkerTriggerThreshold: 200,
};

const MOCK_RULES = [
    { name: 'Block CN', conditionType: 'country' as const, conditionValue: 'CN', action: 'block' as const },
    { name: 'Challenge UserAgent', conditionType: 'user_agent' as const, conditionValue: 'BadBot', action: 'challenge' as const },
];

// 4. Test Runner
function runTest(name: string, ip: string, country: string, ua: string, rate: number, config: any, expected: string) {
    try {
        const result = evaluateRequest(ip, country, ua, rate, config, MOCK_RULES);
        if (result === expected) {
            console.log(`✅ [PASS] ${name}`);
        } else {
            console.error(`❌ [FAIL] ${name}`);
            console.error(`   Expected: ${expected}`);
            console.error(`   Got:      ${result}`);
            process.exit(1);
        }
    } catch (e) {
        console.error(`❌ [ERROR] ${name}:`, e);
        process.exit(1);
    }
}

console.log('🛡️  Running Shield Logic Unit Tests...\n');

// Scenarios
runTest('Normal Traffic', '1.2.3.4', 'US', 'Mozilla/5.0', 10, MOCK_CONFIG, 'allow');
runTest('Country Block (CN)', '1.2.3.4', 'CN', 'Mozilla/5.0', 10, MOCK_CONFIG, 'block');
runTest('User-Agent Challenge', '1.2.3.4', 'US', 'BadBot v1.0', 10, MOCK_CONFIG, 'challenge');
runTest('Rate Limit Breach', '1.2.3.4', 'US', 'Mozilla/5.0', 150, MOCK_CONFIG, 'challenge');
runTest('Bunker Trigger (Volumetric)', '1.2.3.4', 'US', 'Mozilla/5.0', 250, MOCK_CONFIG, 'challenge');

const BUNKER_MODE = { ...MOCK_CONFIG, mode: 'bunker' as const };
runTest('Global Bunker Mode', '1.2.3.4', 'US', 'Mozilla/5.0', 10, BUNKER_MODE, 'challenge');

const LOCKDOWN_MODE = { ...MOCK_CONFIG, mode: 'lockdown' as const };
runTest('Global Lockdown Mode', '1.2.3.4', 'US', 'Mozilla/5.0', 10, LOCKDOWN_MODE, 'block');

console.log('\n✨ All Logic Tests Passed!');
