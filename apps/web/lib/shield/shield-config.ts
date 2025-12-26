import { createClient } from '@supabase/supabase-js';
import { ShieldConfig, ShieldRule, evaluateRequest } from './shield-evaluator';

export { evaluateRequest }; // Re-export for middleware

// Access Supabase directly
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = (supabaseUrl && supabaseKey)
    ? createClient(supabaseUrl, supabaseKey)
    : ({} as any);

// In-Memory Fallback (Cache)
let cachedConfig: ShieldConfig = {
    mode: 'monitor',
    rateLimitThreshold: 100,
    bunkerTriggerThreshold: 200,
};

let cachedRules: ShieldRule[] = [
    { name: 'Block Bad Bot', conditionType: 'user_agent', conditionValue: 'BadBot', action: 'block' }
];

export async function getShieldConfig(): Promise<ShieldConfig> {
    try {
        if (!supabase) return cachedConfig;

        const { data, error } = await supabase
            .from('shield_config')
            .select('*')
            .single();

        if (error || !data) {
            // If table doesn't exist or empty, return default/cache
            // console.warn('Shield Config DB Read Failed (using cache):', error?.message);
            return cachedConfig;
        }

        cachedConfig = {
            mode: data.mode,
            rateLimitThreshold: data.rate_limit_threshold,
            bunkerTriggerThreshold: data.bunker_trigger_threshold
        };
        return cachedConfig;
    } catch (e) {
        return cachedConfig;
    }
}

export async function updateShieldConfig(newConfig: Partial<ShieldConfig>) {
    cachedConfig = { ...cachedConfig, ...newConfig };

    try {
        // Upsert logic (assuming single row for workspace, or just updating the first one)
        // For this demo we'll try to update the first row found
        if (!supabase) return;

        const { error } = await supabase
            .from('shield_config')
            .update({
                mode: newConfig.mode,
                rate_limit_threshold: newConfig.rateLimitThreshold,
                bunker_trigger_threshold: newConfig.bunkerTriggerThreshold,
                updated_at: new Date().toISOString()
            })
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Dummy filter to update all (or specific logic)

        // If update failed (e.g. no rows), try insert? 
        // Real implementation requires workspace_id context.
    } catch (e) {
        console.error('Shield Config Sync Failed', e);
    }
}

export async function getShieldRules(): Promise<ShieldRule[]> {
    try {
        if (!supabase) return cachedRules;

        const { data, error } = await supabase
            .from('shield_rules')
            .select('*')
            .eq('is_active', true);

        if (error || !data) return cachedRules;

        cachedRules = data.map((r: any) => ({
            name: r.name,
            conditionType: r.condition_type,
            conditionValue: r.condition_value,
            action: r.action
        }));
        return cachedRules;
    } catch (e) {
        return cachedRules;
    }
}

export async function addShieldRule(rule: ShieldRule) {
    cachedRules.push(rule);
    try {
        if (supabase) {
            await supabase.from('shield_rules').insert({
                name: rule.name,
                condition_type: rule.conditionType,
                condition_value: rule.conditionValue,
                action: rule.action,
                is_active: true
            });
        }
    } catch (e) {
        console.warn('Failed to persist rule');
    }
}
